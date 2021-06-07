import { call, put, takeEvery } from "@redux-saga/core/effects";
import { push } from "connected-react-router";
import { Action, createActions, handleActions } from "redux-actions";
import { select } from "redux-saga/effects";
import TokenService from "../../Service/TokenService";
import UserService from "../../Service/UserService";
import { AuthState, LoginReqType } from "../../types";

const initialState: AuthState = {
  token : null,
  loading : false,
  error : null,
};

const prefix = "reviewservice/auth"

export const { pending, success, fail } = createActions(
  "PENDING", 
  "SUCCESS", 
  "FAIL", 
  { prefix }
);

const reducer = handleActions<AuthState, string>(
  {
    PENDING: (state) => ({
      ...state,
      loading: true,
      error: null,
    }),

    SUCCESS: (state, action) => ({
      token: action.payload,
      loading: true,
      error: null,
    }),

    FAIL: (state, action: any) => ({
      ...state,
      loading: false,
      error: action.payload,
    })
  }, initialState, {prefix});

export default reducer

//saga
export const { login, logout } = createActions("LOGIN", "LOGOUT", {prefix}) 

function* loginSaga(action: Action<LoginReqType>) {
  try{
    yield put(pending());
    const token: string = yield call(UserService.login, action.payload);
    TokenService.set(token);
    yield put(success(token));
    yield put(push('/'));
  } catch(err) {
    yield put(fail(new Error(err?.response?.data?.error || 'UNKNOWN ERROR')))
  }
}

function* logoutSaga() {
  try{
    yield put(pending());
    const token: string = yield select(state => state.auth.token)
    yield call(UserService.logout, token);
    TokenService.set(token);
    yield put(success(token));
  } catch(err) {
  } finally {
    TokenService.remove();
    yield put(success(null));
  }
}

export function* authSaga() {
  yield takeEvery(`${prefix}/LOGIN`, loginSaga);
  yield takeEvery(`${prefix}/LOGOUT`, logoutSaga);

}