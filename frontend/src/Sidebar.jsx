// Sidebar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import 'boxicons/css/boxicons.min.css'; // Boxicons CSS'ini import edin

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Çıkış işlemlerini burada gerçekleştirin (örneğin, token silme)
    navigate('/'); // Giriş sayfasına yönlendir
  };

  return (
      <div className="sidebar always-open">
        <div className="sidebar-content">
          <ul className="lists">
            <li className={`list ${location.pathname === '/profile' ? 'active' : ''}`}>
              <Link to="/profile" className="nav-link">
                <i className="bx bx-user icon"></i>
                <span className="link">Profile</span>
              </Link>
            </li>
            <li className={`list ${location.pathname === '/my-courses' ? 'active' : ''}`}>
              <Link to="/my-courses" className="nav-link">
                <i className="bx bx-book icon"></i>
                <span className="link">My Courses</span>
              </Link>
            </li>
            <li className={`list ${location.pathname === '/schedule' ? 'active' : ''}`}>
              <Link to="/schedule" className="nav-link">
                <i className="bx bx-calendar icon"></i>
                <span className="link">Schedule</span>
              </Link>
            </li>
            <li className={`list ${location.pathname === '/all-courses' ? 'active' : ''}`}>
              <Link to="/all-courses" className="nav-link">
                <i className="bx bx-book-open icon"></i>
                <span className="link">All Courses</span>
              </Link>
            </li>
            <li className={`list ${location.pathname === '/ratings' ? 'active' : ''}`}>
              <Link to="/ratings" className="nav-link">
                <i className="bx bx-star icon"></i>
                <span className="link">Ratings</span>
              </Link>
            </li>
            <li className={`list ${location.pathname === '/book-pool-lane' ? 'active' : ''}`}>
              <Link to="/book-pool-lane" className="nav-link">
                <i className="bx bx-swim icon"></i>
                <span className="link">Book a Pool Lane</span>
              </Link>
            </li>
            <li className={`list ${location.pathname === '/my-cart' ? 'active' : ''}`}>
              <Link to="/my-cart" className="nav-link">
                <i className="bx bx-cart icon"></i>
                <span className="link">My Cart</span>
              </Link>
            </li>
          </ul>
          <div className="bottom-content">
            <li className="list">
              <button onClick={handleLogout} className="nav-link">
                <i className="bx bx-log-out icon"></i>
                <span className="link">Log out</span>
              </button>
            </li>
          </div>
        </div>
      </div>
  );
};

export default Sidebar;
