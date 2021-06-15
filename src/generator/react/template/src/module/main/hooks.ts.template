import Recoil from 'recoil'
import { MainState } from 'module/main'
import type { State } from './type'

export const useMainState = <T>(fn: (state: State) => T): T => {
    const state = Recoil.useRecoilValue(MainState);
    return fn(state);
}