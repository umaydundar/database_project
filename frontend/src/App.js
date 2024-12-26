// App.js
import React, { useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from "./MainPage";
import Register from "./Register";
import MyCourses from "./MyCourses";
import Schedule from "./Schedule";
import AllCourses from "./AllCourses";
import Ratings from "./Ratings";
import BookPoolLane from "./BookPoolLane";
import Profile from "./Profile";


function App() {

    return (
        <Router>
            {/* Rotalar */}
            <Routes>
                <Route path="/" element={<MainPage/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/my-courses" element={<MyCourses/>}/>
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/all-courses" element={<AllCourses />} />
                <Route path="/ratings" element={<Ratings />} />
                <Route path="/book-pool-lane" element={<BookPoolLane />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </Router>
    );
}

export default App;
