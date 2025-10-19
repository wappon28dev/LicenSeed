import { styled as p } from "panda/jsx";
import { type ReactElement, useState, useEffect } from "react";
import { api } from "@/lib/services/api";
import { SeedBaseSelectorDialog } from "@/pages/seeds/new/wizard/_components/SeedBaseSelectorDialog";
import type {
  SeedBaseGroup,
  CompatibilityScore,
  Summary,
} from "@/types/bindings";

export default function ComparePage(): ReactElement {
  const [seedGroups, setSeedGroups] = useState<SeedBaseGroup[]>([]);
  const [selectedSourceSeed, setSelectedSourceSeed] = useState<string>("");
  const [selectedSourceSeedName, setSelectedSourceSeedName] =
    useState<string>("");
  const [selectedTargetGroup, setSelectedTargetGroup] = useState<string>("");
  const [compatibilityScores, setCompatibilityScores] = useState<
    CompatibilityScore[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // 初期化時にシードグループを読み込み
  useEffect(() => {
    const loadSeedGroups = async () => {
      try {
        const result = await api.collectSeedBaseGroups();
        if (result.status === "ok") {
          setSeedGroups(result.data);
        } else {
          console.error("Failed to load seed groups:", result.error);
          setError("シードグループの読み込みに失敗しました");
        }
      } catch (err) {
        console.error("Failed to load seed groups:", err);
        setError("シードグループの読み込みに失敗しました");
      }
    };

    void loadSeedGroups();
  }, []);

  const handleCompare = async () => {
    if (!selectedSourceSeed || !selectedTargetGroup) {
      setError("比較元のシードと比較先のグループを選択してください");
      return;
    }

    setLoading(true);
    setError("");

    console.log("Calling getCompatibilityScores with:", {
      sourceSeedId: selectedSourceSeed,
      targetGroupName: selectedTargetGroup,
    });

    try {
      const result = await api.getCompatibilityScores(
        selectedSourceSeed,
        selectedTargetGroup,
      );
      if (result.status === "ok") {
        setCompatibilityScores(result.data);
      } else {
        console.error(
          "Failed to calculate compatibility scores:",
          result.error,
        );
        let errorMessage = "互換性スコアの計算に失敗しました";

        // エラータイプに応じてメッセージを調整
        if (result.error.type === "NOT_FOUND") {
          errorMessage = "指定されたシードまたはグループが見つかりません";
        } else if (result.error.type === "READING_ERROR") {
          errorMessage = `ファイル読み込みエラー: ${result.error.error}`;
        } else if (result.error.type === "CALCULATION_ERROR") {
          errorMessage = `計算エラー: ${result.error.error}`;
        }

        setError(errorMessage);
      }
    } catch (err) {
      console.error("Failed to calculate compatibility scores:", err);
      setError("互換性スコアの計算に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>シードの比較</h1>

      {error && <div>{error}</div>}

      {/* 比較元シード選択 */}
      <div>
        <h2>比較元シード</h2>
        <div>
          {selectedSourceSeed ? (
            <div>
              <div>{selectedSourceSeedName}</div>
              <div>{selectedSourceSeed}</div>
            </div>
          ) : (
            <div>比較元のシードを選択してください</div>
          )}

          <SeedBaseSelectorDialog
            setSelectedId={(id: string) => {
              setSelectedSourceSeed(id);
              const seed = seedGroups
                .flatMap((g) => g.bases)
                .find((s) => s.id === id);
              if (seed) {
                setSelectedSourceSeedName(seed.name);
              }
            }}
            setSummary={(summary: Summary) => {
              // 比較ページでは summary は使用しないが、必須パラメータなので空関数を渡す
            }}
          />
        </div>
      </div>

      {/* 比較先グループ選択 */}
      <div style={{ marginBottom: "20px" }}>
        <h2>比較先グループ</h2>
        <div style={{ marginTop: "10px" }}>
          {seedGroups.map((group) => (
            <label key={group.manifest.group}>
              <input
                checked={selectedTargetGroup === group.manifest.group}
                name="targetGroup"
                onChange={(e) => {
                  setSelectedTargetGroup(e.target.value);
                }}
                type="radio"
                value={group.manifest.group}
              />
              {group.manifest.name} ({group.manifest.group})
            </label>
          ))}
        </div>
      </div>

      {/* 比較実行ボタン */}
      <div style={{ marginBottom: "30px" }}>
        <button
          disabled={!selectedSourceSeed || !selectedTargetGroup || loading}
          onClick={handleCompare}
          style={{
            padding: "10px 20px",
            backgroundColor:
              !selectedSourceSeed || !selectedTargetGroup || loading
                ? "#ccc"
                : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor:
              !selectedSourceSeed || !selectedTargetGroup || loading
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loading ? "計算中..." : "互換性を比較"}
        </button>
      </div>

      {/* 結果表示 */}
      {compatibilityScores.length > 0 && (
        <div>
          <h2>互換性スコア結果</h2>
          <table>
            <thead>
              <tr>
                <th>順位</th>
                <th>ライセンス名</th>
                <th>ID</th>
                <th>互換性スコア</th>
              </tr>
            </thead>
            <tbody>
              {compatibilityScores.map((score, index) => {
                const seedInfo = seedGroups
                  .flatMap((g) => g.bases)
                  .find((s) => s.id === score.seed_id);

                return (
                  <p.tr key={score.seed_id} fontFamily="udev">
                    <td>#{index + 1}</td>
                    <td>{seedInfo?.name || score.seed_id}</td>
                    <td>{score.seed_id}</td>
                    <p.td>{(score.score * 100).toFixed(1)}%</p.td>
                  </p.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
