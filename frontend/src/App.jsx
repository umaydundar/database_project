import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainPage from "./FirstPage/MainPage";
import Register from "./FirstPage/Register";
import ChangePassword from "./FirstPage/ChangePassword";

import MyCoursesNonMember from "./user_Swimmer/NonMember/MyCoursesNonMember";
import ScheduleNonMember from "./user_Swimmer/NonMember/ScheduleNonMember";
import AllCoursesNonMember from "./user_Swimmer/NonMember/AllCoursesNonMember";
import BookPoolLaneNonMember from "./user_Swimmer/NonMember/BookPoolLaneNonMember";
import ProfileNonMember from "./user_Swimmer/NonMember/ProfileNonMember";
import MyCartNonMember from "./user_Swimmer/NonMember/MyCartNonMember";
import UpcomingBookingsNonMember from "./user_Swimmer/NonMember/UpcomingBookingsNonMember";
import Membership from "./user_Swimmer/NonMember/BecomeMember";

import MyCoursesMember from "./user_Swimmer/Member/MyCoursesMember";
import ScheduleMember from "./user_Swimmer/Member/ScheduleMember";
import AllCoursesMember from "./user_Swimmer/Member/AllCoursesMember";
import BookPoolLaneMember from "./user_Swimmer/Member/BookPoolLaneMember";
import ProfileMember from "./user_Swimmer/Member/ProfileMember";
import MyCartMember from "./user_Swimmer/Member/MyCartMember";
import UpcomingBookingsMember from "./user_Swimmer/Member/UpcomingBookingsMember";
import Cafe from "./user_Swimmer/Member/Cafe";

import WithdrawMoneyCoach from "./user_Coach/WithdrawMoneyCoach";
import CreateCourse from "./user_Coach/CreateCourse";
import ScheduleCoach from "./user_Coach/ScheduleCoach";
import ViewCoursesCoach from "./user_Coach/ViewCoursesCoach";

import Report from "./user_Admin/Report";
import ManageUsers from "./user_Admin/ManageUsers";
import ManageCourses from "./user_Admin/ManageCourses";
import ManagePoolBookings from "./user_Admin/ManagePoolBookings";

import LifeguardSelect from "./user_Lifeguard/LifeguardSelect";
import UpcomingHours from "./user_Lifeguard/UpcomingHours";
import WithdrawMoneyLifeguard from "./user_Lifeguard/WithdrawMoneyLifeguard";

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<MainPage />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/register" element={<Register />} />

                {/* Admin Routes */}
                <Route path="/admin/report" element={<Report />} />
                <Route path="/admin/manage-users" element={<ManageUsers />} />
                <Route path="/admin/manage-courses" element={<ManageCourses />} />
                <Route path="/admin/manage-bookings" element={<ManagePoolBookings />} />

                {/* Lifeguard Routes */}
                <Route path="/lifeguard/select-working-hours" element={<LifeguardSelect />} />
                <Route path="/lifeguard/upcoming-hours" element={<UpcomingHours />} />
                <Route path="/lifeguard/withdraw-money" element={<WithdrawMoneyLifeguard />} />

                {/* Non-Member Routes */}
                <Route path="/non-member/my-courses" element={<MyCoursesNonMember />} />
                <Route path="/non-member/schedule" element={<ScheduleNonMember />} />
                <Route path="/non-member/all-courses" element={<AllCoursesNonMember />} />
                <Route path="/non-member/book-pool-lane" element={<BookPoolLaneNonMember />} />
                <Route path="/non-member/profile" element={<ProfileNonMember />} />
                <Route path="/non-member/my-cart" element={<MyCartNonMember />} />
                <Route path="/non-member/upcoming-bookings" element={<UpcomingBookingsNonMember />} />
                <Route path="/non-member/membership" element={<Membership />} />

                {/* Member Routes */}
                <Route path="/member/my-courses" element={<MyCoursesMember />} />
                <Route path="/member/schedule" element={<ScheduleMember />} />
                <Route path="/member/all-courses" element={<AllCoursesMember />} />
                <Route path="/member/book-pool-lane" element={<BookPoolLaneMember />} />
                <Route path="/member/profile" element={<ProfileMember />} />
                <Route path="/member/my-cart" element={<MyCartMember />} />
                <Route path="/member/upcoming-bookings" element={<UpcomingBookingsMember />} />
                <Route path="/member/cafe" element={<Cafe />} />

                {/* Coach Routes */}
                <Route path="/coach/create-course" element={<CreateCourse />} />
                <Route path="/coach/schedule" element={<ScheduleCoach />} />
                <Route path="/coach/view-courses" element={<ViewCoursesCoach />} />
                <Route path="/coach/withdraw-money" element={<WithdrawMoneyCoach />} />
            </Routes>
        </Router>
    );
}

export default App;
