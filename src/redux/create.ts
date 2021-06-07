// store
import { applyMiddleware, createStore } from "redux"
import { composeWithDevTools } from "redux-devtools-extension"
import reducer from "./modules/reducer";
import createSagaMiddleWare from 'redux-saga'
import rootSaga from "./modules/rootSaga";
import { routerMiddleware } from 'connected-react-router';
import history from '../history';
import TokenService from "../Service/TokenService";

const create = () => {
  const token = TokenService.get();
  const sagaMiddleWare = createSagaMiddleWare();
  const store = createStore (
    reducer(history), 
    { 
      auth : {
        token,
        loading: false,
        error: null,
      }
    },
    composeWithDevTools(applyMiddleware(sagaMiddleWare, routerMiddleware(history)))
  )
  
  sagaMiddleWare.run(rootSaga);
  
  return store;
}

export default create;