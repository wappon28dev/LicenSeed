// Generouted, changes to this file will be overriden
/* eslint-disable */

import { components, hooks, utils } from '@generouted/react-router/client'

export type Path =
  | `/`
  | `/seeds/new`
  | `/seeds/new/overview`
  | `/seeds/new/wizard`
  | `/seeds/new/wizard/:idx`
  | `/viewer`

export type Params = {
  '/seeds/new/wizard/:idx': { idx: string }
}

export type ModalPath = never

export const { Link, Navigate } = components<Path, Params>()
export const { useModals, useNavigate, useParams } = hooks<Path, Params, ModalPath>()
export const { redirect } = utils<Path, Params>()
