/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter, Route, Switch, Redirect
} from 'react-router-dom';
import _ from 'lodash';
import loadable from '@loadable/component';
import routeConfig from './config';

const getType = (value) => Object.prototype.toString.call(value).slice(8, -1);

const format = (routes) => {
  const redirectRoutes = [];
  function recursive(deepRoutes) {
    return deepRoutes.reduce((pre, i) => {
      let nPre = pre;
      const item = i;
      if (item.redirect) {
        redirectRoutes.push({
          from: item.path,
          to: item.redirect
        });
        return nPre;
      }
      if (item.children) {
        nPre = nPre.concat(recursive(item.children));
      }
      if (item.component && getType(item.component) === 'Function'
        && !item.remoteComp) {
        item.component = loadable(item.component);
      }
      nPre = nPre.concat(_.omit(item, 'routes'));
      return nPre;
    }, []);
  }
  const flatRoutes = recursive(routes);
  return {
    redirectRoutes,
    flatRoutes
  };
};

export default () => {
  const [route, setRoute] = useState([]);
  const [redirectRoute, setRedirectRoute] = useState([]);

  useEffect(() => {
    const { redirectRoutes, flatRoutes } = format(routeConfig);
    setRoute(flatRoutes);
    setRedirectRoute(redirectRoutes);
  }, []);

  return (<BrowserRouter>
    <Switch>
      {redirectRoute.map(item => (
        <Redirect key={item.from} exact from={item.from} to={item.to} />
      ))}
      {route.map(({
        exact, path, component: Comp,
        routes: _routes = []
      }) => (<Route
        key={path}
        exact={!!exact}
        path={path}
        render={(props) => {
          if (Comp) {
            return <Comp {...props} routes={_routes} />;
          }
        }}
      />))}
    </Switch>
  </BrowserRouter>);
};
