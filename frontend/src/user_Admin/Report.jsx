import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import LayoutAdmin from "./LayoutAdmin"; // Import LayoutAdmin
import "./Report.css"; // Ensure this CSS file exists

const ReportPage = () => {
    const [selectedParameters, setSelectedParameters] = useState({
        users: false,
        transactions: false,
        courses: false,
    });

    const [isGenerating, setIsGenerating] = useState(false);

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setSelectedParameters((prevState) => ({
            ...prevState,
            [name]: checked,
        }));
    };

    const generatePDF = () => {
        const { users, transactions, courses } = selectedParameters;
        if (!users && !transactions && !courses) {
            alert("Please select at least one parameter to include in the report.");
            return;
        }

        setIsGenerating(true);

        const reportContent = document.createElement("div");
        reportContent.style.width = "210mm"; // A4 width
        reportContent.style.minHeight = "297mm"; // A4 height
        reportContent.style.padding = "20mm";
        reportContent.style.background = "#fff";
        reportContent.style.color = "#000";
        reportContent.style.fontFamily = "Arial, sans-serif";

        if (users) {
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
                        <tr>
                            <td>1</td>
                            <td>Alice Johnson</td>
                            <td>alice@example.com</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>Bob Smith</td>
                            <td>bob@example.com</td>
                        </tr>
                    </tbody>
                </table>
                <br/>
            `;
            reportContent.appendChild(usersSection);
        }

        if (transactions) {
            const transactionsSection = document.createElement("div");
            transactionsSection.innerHTML = `
                <h2>Transactions Report</h2>
                <table border="1" cellpadding="5" cellspacing="0" width="100%">
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>User</th>
                            <th>Amount</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1001</td>
                            <td>Alice Johnson</td>
                            <td>$50</td>
                            <td>2024-12-01</td>
                        </tr>
                        <tr>
                            <td>1002</td>
                            <td>Bob Smith</td>
                            <td>$75</td>
                            <td>2024-12-05</td>
                        </tr>
                    </tbody>
                </table>
                <br/>
            `;
            reportContent.appendChild(transactionsSection);
        }

        if (courses) {
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
                        <tr>
                            <td>CS101</td>
                            <td>Introduction to Computer Science</td>
                            <td>Dr. Emily Davis</td>
                            <td>200</td>
                        </tr>
                        <tr>
                            <td>SW202</td>
                            <td>Software Engineering</td>
                            <td>Prof. Michael Brown</td>
                            <td>150</td>
                        </tr>
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
                            Include Transactions Information
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
