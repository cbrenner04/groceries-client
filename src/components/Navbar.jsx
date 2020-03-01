import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as $ from 'jquery';

import * as config from '../config/default';
import { setUserInfo } from '../utils/auth';

export default function Navbar() {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);

  useEffect(() => {
    $.ajax({
      type: 'GET',
      url: `${config.apiBase}/`,
      dataType: 'JSON',
      headers: JSON.parse(sessionStorage.getItem('user')),
    })
      .done((data, _status, request) => {
        setUserInfo(request);
        setIsUserSignedIn(data.is_user_signed_in);
      });
  }, []);

  return (
    <div>
      <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-light navbar-full">
        <Link to={isUserSignedIn ? '/' : '/users/sign_in'} className="navbar-brand">Groceries</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbar"
          aria-controls="navbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbar">
          {
            isUserSignedIn &&
              <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
                <li className="nav-item">
                  <Link to="/users/invitation/new" className="nav-link" id="invite-link">
                    Invite
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/users/sign_out" className="nav-link" rel="nofollow" data-method="delete" id="log-out-link">
                    Log out
                  </Link>
                </li>
              </ul>
          }
        </div>
      </nav>
    </div>
  );
}
