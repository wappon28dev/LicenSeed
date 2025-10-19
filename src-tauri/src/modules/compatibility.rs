use log::{debug, error, info};
use serde::{Deserialize, Serialize};
use specta::Type;
use std::{collections::HashMap, collections::HashSet, fs, path};

use super::seed::base::{SeedBase, SeedBaseGroupManifest};
use super::seed::common::SummaryEntry;
use crate::modules::resource::resolve_res_path;

#[derive(Debug, Serialize, Deserialize)]
pub struct TermSimilarityMat {
    pub row_keys: Vec<String>,
    pub col_keys: Vec<String>,
    pub data: Vec<Vec<f64>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TermSimilarityPair {
    pub a_to_b: TermSimilarityMat,
    pub b_to_a: TermSimilarityMat,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AllTermSimilarities {
    pub group_manifest_a: SeedBaseGroupManifest,
    pub group_manifest_b: SeedBaseGroupManifest,
    pub permissions: TermSimilarityPair,
    pub limitations: TermSimilarityPair,
    pub conditions: TermSimilarityPair,
    pub cross_combinations: HashMap<String, TermSimilarityPair>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct CompatibilityScore {
    pub seed_id: String,
    pub score: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(tag = "type", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum CompatibilityErrors {
    NotFound,
    ReadingError { error: String },
    CalculationError { error: String },
}

impl AllTermSimilarities {
    pub fn from_yaml(filename: &str) -> Result<Self, String> {
        let file = fs::File::open(filename).map_err(|e| e.to_string())?;
        let deserialized: Self = serde_yml::from_reader(file).map_err(|e| e.to_string())?;
        Ok(deserialized)
    }
}

fn get_term_keys(entries: &[SummaryEntry]) -> HashSet<&String> {
    entries
        .iter()
        .filter_map(|entry| match entry {
            SummaryEntry::Term { key } => Some(key),
            SummaryEntry::Markdown { .. } => None,
        })
        .collect()
}

pub fn calc_score_limitation(a: &SeedBase, b: &SeedBase) -> f64 {
    let a_l = get_term_keys(&a.summary.limitations);
    let b_l = get_term_keys(&b.summary.limitations);

    if a_l.is_empty() {
        return if b_l.is_empty() {
            1.0
        } else {
            -(b_l.len() as f64)
        };
    }

    let intersection = a_l.intersection(&b_l).count();
    let b_minus_a = b_l.difference(&a_l).count();

    (intersection as f64 - b_minus_a as f64) / a_l.len() as f64
}

pub fn calc_score_permission(a: &SeedBase, b: &SeedBase) -> f64 {
    let a_p = get_term_keys(&a.summary.permissions);
    let b_p = get_term_keys(&b.summary.permissions);

    if a_p.is_empty() {
        return 1.0;
    }

    let intersection = a_p.intersection(&b_p).count();
    let a_minus_b = a_p.difference(&b_p).count();

    (intersection as f64 - a_minus_b as f64) / a_p.len() as f64
}

pub fn calc_score_condition(a: &SeedBase, b: &SeedBase) -> f64 {
    let a_c = get_term_keys(&a.summary.conditions);
    let b_c = get_term_keys(&b.summary.conditions);

    if a_c.is_empty() {
        return if b_c.is_empty() {
            1.0
        } else {
            -(b_c.len() as f64)
        };
    }

    let intersection = a_c.intersection(&b_c).count();
    let b_minus_a = b_c.difference(&a_c).count();

    (intersection as f64 - b_minus_a as f64) / a_c.len() as f64
}

pub fn calc_compat_score(a: &SeedBase, b: &SeedBase) -> f64 {
    let score_l = calc_score_limitation(a, b);
    let score_p = calc_score_permission(a, b);
    let score_c = calc_score_condition(a, b);

    score_l + score_p + score_c
}

// 類似度行列を使った意味的互換性スコア計算
const SIMILARITY_THRESHOLD: f64 = 0.7;

/// 許可に対する意味的交集合のサイズを計算 |A_p ∩ B_p|
fn calc_semantic_intersection_for_permissions(
    similarity_mat: &TermSimilarityMat,
    a_terms: &HashSet<&String>,
    b_terms: &HashSet<&String>,
) -> f64 {
    let mut intersection_size = 0.0;

    for &a_term in a_terms {
        // 完全一致を最優先
        if b_terms.contains(a_term) {
            intersection_size += 1.0;
            continue;
        }

        // 類似度による部分一致
        if let Some(a_idx) = similarity_mat.row_keys.iter().position(|k| k == a_term) {
            let mut max_similarity = 0.0_f64;
            for &b_term in b_terms {
                if let Some(b_idx) = similarity_mat.col_keys.iter().position(|k| k == b_term) {
                    max_similarity = max_similarity.max(similarity_mat.data[a_idx][b_idx]);
                }
            }
            if max_similarity > 0.0 {
                intersection_size += max_similarity;
            }
        }
    }

    intersection_size
}

/// 許可に対する意味的差集合のサイズを計算 |A_p \ B_p|
fn calc_semantic_difference_for_permissions(
    similarity_mat: &TermSimilarityMat,
    a_terms: &HashSet<&String>,
    b_terms: &HashSet<&String>,
) -> f64 {
    let mut difference_size = 0.0;

    for &a_term in a_terms {
        // 完全一致がある場合はカウントしない
        if b_terms.contains(a_term) {
            continue;
        }

        // 類似度による一致度を確認
        let mut max_similarity = 0.0_f64;
        if let Some(a_idx) = similarity_mat.row_keys.iter().position(|k| k == a_term) {
            for &b_term in b_terms {
                if let Some(b_idx) = similarity_mat.col_keys.iter().position(|k| k == b_term) {
                    max_similarity = max_similarity.max(similarity_mat.data[a_idx][b_idx]);
                }
            }
        }

        // 類似度が閾値を下回る場合のみ差集合要素としてカウント
        if max_similarity < SIMILARITY_THRESHOLD {
            difference_size += 1.0;
        }
    }

    difference_size
}

/// 許可スコアを意味的類似度で計算
pub fn calc_permission_score_with_similarity(
    similarity_mat: &TermSimilarityMat,
    a_base: &SeedBase,
    b_base: &SeedBase,
) -> f64 {
    let a_p = get_term_keys(&a_base.summary.permissions);
    let b_p = get_term_keys(&b_base.summary.permissions);

    // |A_p| = 0 の場合は 1 とする
    if a_p.is_empty() {
        return 1.0;
    }

    // 従来の集合演算と同じロジックで意味的類似度を適用
    let intersection_size = calc_semantic_intersection_for_permissions(similarity_mat, &a_p, &b_p);
    let a_minus_b_size = calc_semantic_difference_for_permissions(similarity_mat, &a_p, &b_p);

    (intersection_size - a_minus_b_size) / (a_p.len() as f64)
}

/// 制限スコアを意味的類似度で計算
pub fn calc_limitation_score_with_similarity(
    similarity_mat: &TermSimilarityMat,
    a_base: &SeedBase,
    b_base: &SeedBase,
) -> f64 {
    let a_l = get_term_keys(&a_base.summary.limitations);
    let b_l = get_term_keys(&b_base.summary.limitations);

    if a_l.is_empty() {
        return if b_l.is_empty() {
            1.0
        } else {
            -(b_l.len() as f64)
        };
    }

    // |A_l ∩ B_l| - |B_l \ A_l| / |A_l|
    let intersection_size = calc_semantic_intersection_for_permissions(similarity_mat, &a_l, &b_l);
    let b_minus_a_size = calc_semantic_difference_for_permissions(similarity_mat, &b_l, &a_l);

    (intersection_size - b_minus_a_size) / (a_l.len() as f64)
}

/// 条件スコアを意味的類似度で計算（制限と同じロジック）
pub fn calc_condition_score_with_similarity(
    similarity_mat: &TermSimilarityMat,
    a_base: &SeedBase,
    b_base: &SeedBase,
) -> f64 {
    let a_c = get_term_keys(&a_base.summary.conditions);
    let b_c = get_term_keys(&b_base.summary.conditions);

    if a_c.is_empty() {
        return if b_c.is_empty() {
            1.0
        } else {
            -(b_c.len() as f64)
        };
    }

    // |A_c ∩ B_c| - |B_c \ A_c| / |A_c|
    let intersection_size = calc_semantic_intersection_for_permissions(similarity_mat, &a_c, &b_c);
    let b_minus_a_size = calc_semantic_difference_for_permissions(similarity_mat, &b_c, &a_c);

    (intersection_size - b_minus_a_size) / (a_c.len() as f64)
}

/// 意味的類似度を使った互換性スコア計算
pub fn calc_compat_score_with_similarity(
    all_similarities: &AllTermSimilarities,
    a_base: &SeedBase,
    b_base: &SeedBase,
    use_a_to_b: bool,
) -> f64 {
    let permissions_mat = if use_a_to_b {
        &all_similarities.permissions.a_to_b
    } else {
        &all_similarities.permissions.b_to_a
    };

    let limitations_mat = if use_a_to_b {
        &all_similarities.limitations.a_to_b
    } else {
        &all_similarities.limitations.b_to_a
    };

    let conditions_mat = if use_a_to_b {
        &all_similarities.conditions.a_to_b
    } else {
        &all_similarities.conditions.b_to_a
    };

    let p_score = calc_permission_score_with_similarity(permissions_mat, a_base, b_base);
    let l_score = calc_limitation_score_with_similarity(limitations_mat, a_base, b_base);
    let c_score = calc_condition_score_with_similarity(conditions_mat, a_base, b_base);

    p_score + l_score + c_score
}

/// 比較元のベースシード（例：@general/CC-BY-4.0）と比較先のベースシードグループ（例：@software）を引数に、
/// 比較先のベースシードグループに所属しているシードと互換スコアの連想配列を計算する関数
pub fn calculate_compatibility_scores(
    handle: tauri::AppHandle,
    source_seed_id: String,
    target_group_name: String,
) -> Result<Vec<CompatibilityScore>, CompatibilityErrors> {
    info!(
        "Calculating compatibility scores for {} -> {}",
        source_seed_id, target_group_name
    );

    // 1. 対応するAllTermSimilaritiesファイルを読み込み
    // ファイル名は「source_group-target_group.yaml」の形式
    let source_group = source_seed_id.split('/').next().unwrap_or("");

    // グループ名をソートして、常に同じ順序でファイル名を生成
    let group1 = source_group.replace("@", "");
    let group2 = target_group_name.replace("@", "");

    let (similarities_file, use_a_to_b) = if group1 <= group2 {
        (format!("{}-{}.yaml", group1, group2), true)
    } else {
        (format!("{}-{}.yaml", group2, group1), false)
    };

    debug!("Source seed ID: {}", source_seed_id);
    debug!("Target group name: {}", target_group_name);
    debug!("Source group: {}", source_group);
    debug!("Generated file name: {}", similarities_file);
    debug!("Use a_to_b direction: {}", use_a_to_b);

    debug!(
        "Looking for similarities file: {} (source_group: {}, target_group: {})",
        similarities_file, source_group, target_group_name
    );

    let similarities_path = resolve_res_path(
        handle.clone(),
        path::Path::new("seeds").join(&similarities_file),
    )
    .map_err(|e| {
        error!("Failed to resolve similarities file path: {}", e);
        CompatibilityErrors::NotFound
    })?;

    debug!("Loading similarities from: {:?}", similarities_path);

    let similarities = AllTermSimilarities::from_yaml(similarities_path.to_str().unwrap())
        .map_err(|e| {
            error!("Failed to read similarities file: {}", e);
            CompatibilityErrors::ReadingError { error: e }
        })?;

    // 2. 対象グループのシードベース一覧を取得
    let target_group = crate::modules::seed::base::collect_seed_base_groups(handle.clone())?
        .into_iter()
        .find(|g| g.manifest.group == target_group_name)
        .ok_or_else(|| {
            error!("Target group not found: {}", target_group_name);
            CompatibilityErrors::NotFound
        })?;

    // 3. 各シードに対する互換性スコアを計算
    let mut scores = Vec::new();
    for seed_base in target_group.bases {
        let score = calculate_single_compatibility_score(
            &similarities,
            &source_seed_id,
            &seed_base.id,
            use_a_to_b,
            handle.clone(),
        )?;
        scores.push(CompatibilityScore {
            seed_id: seed_base.id,
            score,
        });
    }

    // スコア順にソート（降順）
    scores.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());

    debug!("Calculated {} compatibility scores", scores.len());
    Ok(scores)
}

/// 単一のシードに対する互換性スコアを計算
fn calculate_single_compatibility_score(
    similarities: &AllTermSimilarities,
    source_seed_id: &str,
    target_seed_id: &str,
    use_a_to_b: bool,
    handle: tauri::AppHandle,
) -> Result<f64, CompatibilityErrors> {
    debug!(
        "Calculating score for {} -> {}",
        source_seed_id, target_seed_id
    );

    // グループを抽出
    let source_group = source_seed_id.split('/').next().unwrap_or("");
    let target_group = target_seed_id.split('/').next().unwrap_or("");

    debug!(
        "Source group: {}, Target group: {}",
        source_group, target_group
    );

    // 対応するSeedBaseを取得
    let source_seed =
        crate::modules::seed::base::get_seed_base(handle.clone(), source_seed_id.to_string())
            .map_err(|e| CompatibilityErrors::from(e))?;

    let target_seed = crate::modules::seed::base::get_seed_base(handle, target_seed_id.to_string())
        .map_err(|e| CompatibilityErrors::from(e))?;

    // グループに基づいて計算方法を選択
    let final_score = if source_group == target_group {
        // 同じシードグループ間: 単純な集合演算
        debug!(
            "Using calc_compat_score for same-group compatibility: {} -> {}",
            source_group, target_group
        );
        calc_compat_score(&source_seed, &target_seed)
    } else {
        // 異なるシードグループ間: 意味的類似度
        debug!(
            "Using calc_compat_score_with_similarity for cross-group compatibility: {} -> {}",
            source_group, target_group
        );
        calc_compat_score_with_similarity(similarities, &source_seed, &target_seed, use_a_to_b)
    };

    // スコアを0.0〜1.0の範囲に正規化
    let normalized_score = ((final_score + 3.0) / 6.0).max(0.0).min(1.0);

    debug!(
        "Score for {} -> {}: {} (raw: {}, normalized: {})",
        source_seed_id, target_seed_id, normalized_score, final_score, normalized_score
    );

    Ok(normalized_score)
}

// CompatibilityErrorsとGetSeedBaseErrorsの相互変換
impl From<crate::modules::seed::base::GetSeedBaseErrors> for CompatibilityErrors {
    fn from(error: crate::modules::seed::base::GetSeedBaseErrors) -> Self {
        match error {
            crate::modules::seed::base::GetSeedBaseErrors::NotFound => {
                CompatibilityErrors::NotFound
            }
            crate::modules::seed::base::GetSeedBaseErrors::ReadingError { error } => {
                CompatibilityErrors::ReadingError { error }
            }
        }
    }
}

/// Tauri コマンド: 互換性スコアを取得
///
/// 使用例:
/// ```typescript
/// // UI側からの呼び出し例
/// const scores = await invoke("get_compatibility_scores", {
///     sourceSeedId: "@general/CC-BY-4.0",
///     targetGroupName: "@software"
/// });
///
/// // scores は CompatibilityScore[] 型で、以下のような形式:
/// // [
/// //   { seed_id: "@software/MIT", score: 0.85 },
/// //   { seed_id: "@software/BSD-3-Clause", score: 0.72 },
/// //   { seed_id: "@software/GPL-3.0", score: 0.45 }
/// // ]
/// ```
#[tauri::command]
#[specta::specta]
pub fn get_compatibility_scores(
    handle: tauri::AppHandle,
    source_seed_id: String,
    target_group_name: String,
) -> Result<Vec<CompatibilityScore>, CompatibilityErrors> {
    calculate_compatibility_scores(handle, source_seed_id, target_group_name)
}
