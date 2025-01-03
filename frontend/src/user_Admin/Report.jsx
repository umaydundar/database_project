import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import LayoutAdmin from "./LayoutAdmin"; // Import LayoutAdmin
import "./Report.css"; // Ensure this CSS file exists

const ReportPage = () => {
    const [selectedParameters, setSelectedParameters] = useState({
        users: false,
        transactions: false,
        courses: false,
    });
    const [reportData, setReportData] = useState({
        users: [],
        transactions: [],
        courses: [],
    });
    const [isGenerating, setIsGenerating] = useState(false);

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setSelectedParameters((prevState) => ({
            ...prevState,
            [name]: checked,
        }));
    };

    const fetchData = async () => {
        const { users, transactions, courses } = selectedParameters;

        try {
            const fetchPromises = [];
            if (users) {
                fetchPromises.push(
                    axios
                        .get("http://127.0.0.1:8000/api/users/")
                        .then((response) => ({
                            key: "users",
                            data: response.data.users || [],
                        }))
                );
            }
            if (transactions) {
                fetchPromises.push(
                    axios
                        .get("http://127.0.0.1:8000/api/get_buying_history_all_users/")
                        .then((response) => ({
                            key: "transactions",
                            data: response.data.buying_history || [],
                        }))
                );
            }
            if (courses) {
                fetchPromises.push(
                    axios
                        .get("http://127.0.0.1:8000/api/all_courses/")
                        .then((response) => ({
                            key: "courses",
                            data: response.data.courses || [],
                        }))
                );
            }

            const results = await Promise.all(fetchPromises);
            const newReportData = {};
            results.forEach(({ key, data }) => {
                newReportData[key] = data;
            });
            setReportData((prev) => ({ ...prev, ...newReportData }));
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("An error occurred while fetching report data. Please check the console for details.");
        }
    };

    const generatePDF = async () => {
        const { users, transactions, courses } = selectedParameters;

        if (!users && !transactions && !courses) {
            alert("Please select at least one parameter to include in the report.");
            return;
        }

        setIsGenerating(true);

        await fetchData();

        if (
            (!users || reportData.users.length === 0) &&
            (!transactions || reportData.transactions.length === 0) &&
            (!courses || reportData.courses.length === 0)
        ) {
            alert("No data available for the selected parameters.");
            setIsGenerating(false);
            return;
        }

        const reportContent = document.createElement("div");
        reportContent.style.width = "210mm"; // A4 width
        reportContent.style.minHeight = "297mm"; // A4 height
        reportContent.style.padding = "20mm";
        reportContent.style.background = "#fff";
        reportContent.style.color = "#000";
        reportContent.style.fontFamily = "Arial, sans-serif";

        if (users && reportData.users.length) {
            const usersSection = document.createElement("div");
            usersSection.innerHTML = `
                <h2>Users Report</h2>
                <table border="1" cellpadding="5" cellspacing="0" width="100%">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportData.users
                .map(
                    (user) => `
                                <tr>
                                    <td>${user.user_id || "N/A"}</td>
                                    <td>${user.forename || "N/A"} ${user.surname || ""}</td>
                                    <td>${user.username || "N/A"}</td>
                                </tr>
                            `
                )
                .join("")}
                    </tbody>
                </table>
                <br/>
            `;
            reportContent.appendChild(usersSection);
        }

        if (transactions && reportData.transactions.length) {
            const transactionsSection = document.createElement("div");
            transactionsSection.innerHTML = `
                <h2>Transactions Report</h2>
                <table border="1" cellpadding="5" cellspacing="0" width="100%">
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>User</th>
                            <th>Course</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportData.transactions
                .map(
                    (transaction) => `
                                <tr>
                                    <td>${transaction.history_id || "N/A"}</td>
                                    <td>${transaction.purchaser_id || "N/A"}</td>
                                    <td>${transaction.course_id || "N/A"}</td>
                                    <td>${transaction.purchased_at || "N/A"}</td>
                                </tr>
                            `
                )
                .join("")}
                    </tbody>
                </table>
                <br/>
            `;
            reportContent.appendChild(transactionsSection);
        }

        if (courses && reportData.courses.length) {
            const coursesSection = document.createElement("div");
            coursesSection.innerHTML = `
                <h2>Courses Report</h2>
                <table border="1" cellpadding="5" cellspacing="0" width="100%">
                    <thead>
                        <tr>
                            <th>Course ID</th>
                            <th>Title</th>
                            <th>Instructor</th>
                            <th>Enrollment</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportData.courses
                .map(
                    (course) => `
                                <tr>
                                    <td>${course.course_id || "N/A"}</td>
                                    <td>${course.course_name || "N/A"}</td>
                                    <td>${course.coach_name || "N/A"}</td>
                                    <td>${course.enrollment || "N/A"}</td>
                                </tr>
                            `
                )
                .join("")}
                    </tbody>
                </table>
                <br/>
            `;
            reportContent.appendChild(coursesSection);
        }

        document.body.appendChild(reportContent);

        html2canvas(reportContent, { scale: 2 })
            .then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "mm", "a4");

                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                pdf.save("report.pdf");

                document.body.removeChild(reportContent);
                setIsGenerating(false);
            })
            .catch((error) => {
                console.error("Error generating PDF:", error);
                setIsGenerating(false);
                alert("An error occurred while generating the report.");
            });
    };

    return (
        <LayoutAdmin>
            <div className="report-page-content">
                <h1>Generate Report</h1>
                <form className="report-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                name="users"
                                checked={selectedParameters.users}
                                onChange={handleCheckboxChange}
                            />
                            Include Users Information
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                name="transactions"
                                checked={selectedParameters.transactions}
                                onChange={handleCheckboxChange}
                            />
                            Include Buying History Information
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                name="courses"
                                checked={selectedParameters.courses}
                                onChange={handleCheckboxChange}
                            />
                            Include Courses Information
                        </label>
                    </div>
                    <button
                        type="button"
                        className="generate-button"
                        onClick={generatePDF}
                        disabled={isGenerating}
                    >
                        {isGenerating ? "Generating..." : "Generate Report"}
                    </button>
                </form>
            </div>
        </LayoutAdmin>
    );
};

export default ReportPage;