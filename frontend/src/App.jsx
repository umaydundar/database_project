// App.js
// import React, { useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from "./FirstPage/MainPage";
import Register from "./FirstPage/Register";
import MyCourses from "./Swimmer/MyCourses";
import Schedule from "./Schedule";
import AllCourses from "./AllCourses";
import Ratings from "./Ratings";
import BookPoolLane from "./BookPoolLane";
import Profile from "./Profile";
import MyCart from "./MyCart";
import ChangePassword from "./FirstPage/ChangePassword";
import UpcomingBookings from "./UpcomingBookings";
import Membership from "./Membership";
import Cafe from "./Cafe";
import CreateCourse from "./CreateCourse";
import Report from "./Report";
import ManageUsers from "./ManageUsers";
import ManageCourses from "./ManageCourses";
import ManagePoolBookings from "./ManagePoolBookings";
import LifeguardSelect from "./LifeguardSelect";

function App() {

    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage/>}/>
                <Route path="/change-password" element={<ChangePassword/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/my-courses" element={<MyCourses/>}/>
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/all-courses" element={<AllCourses />} />
                <Route path="/ratings" element={<Ratings />} />
                <Route path="/book-pool-lane" element={<BookPoolLane />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-cart" element={<MyCart/>} />
                <Route path="/upcoming-bookings" element={<UpcomingBookings />} />
                <Route path="/membership" element={<Membership />} />
                <Route path="/cafe" element={<Cafe />} />
                <Route path="/create-course" element={<CreateCourse />} />
                <Route path="/report" element={<Report />} />
                <Route path="/manage-users" element={<ManageUsers />} />
                <Route path="/manage-courses" element={<ManageCourses />} />
                <Route path="/manage-bookings" element={<ManagePoolBookings />} />
                <Route path="/lifeguard-select" element={<LifeguardSelect />} />
            </Routes>
        </Router>
    );
}

export default App;
