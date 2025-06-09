import * as React from "react";
import { Component } from "react";
import { Router, Route, IndexRoute, hashHistory } from "react-router";
import Cart from "../Cart/Cart";
import ProductPage from "../Product/ProductPage";
import { Layout } from "../Layout/Layout";
import Distributer from "../Distributer";

export default class AppRouter extends Component<any, any> {
  public render() {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={Layout}>
          <IndexRoute component={Distributer} />
          <Route path="cart" component={Cart} />
          <Route path="product-details/:Code" component={ProductPage} />
        </Route>
      </Router>
    );
  }
}
