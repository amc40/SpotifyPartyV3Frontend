import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { Home, AuthenticationPage, PartyPage } from './components';

function App() {
  return (
    <main> 
      <Switch>
        <Route path="/" component={Home} exact/>
        <Route path='/auth' component={AuthenticationPage}/>
        <Route path='/party' component={PartyPage}/>
      </Switch>
    </main>
  );
}
  


export default App;
