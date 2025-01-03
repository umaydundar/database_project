import datetime
import json
from django.http import JsonResponse
from django.views import View
from django.db import connection
from django.core.mail import send_mail
from django.middleware.csrf import get_token
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from datetime import datetime, timedelta
import base64
import logging
logger = logging.getLogger(__name__)


class GetCSRFTokenView(View):
    def get(self, request):
        csrf_token = get_token(request)
        return JsonResponse({"csrfToken": csrf_token})

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM all_users WHERE username=%s AND password=%s", [username, password])
            user = cursor.fetchone()

        if user:
            user_id = user[0]
            request.session['user_id'] = user_id
            print(user)
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM member_swimmer WHERE swimmer_id=%s", [user_id])
                swimmer = cursor.fetchone()
                
                if swimmer:
                    return JsonResponse({"user_role": "member", "user_id": user_id}, status=200)

                cursor.execute("SELECT * FROM coach WHERE coach_id=%s", [user_id])
                coach = cursor.fetchone()
                if coach:                  
                    return JsonResponse({"user_role": "coach", "user_id": user_id}, status=200)

                cursor.execute("SELECT * FROM lifeguard WHERE lifeguard_id=%s", [user_id])
                lifeguard = cursor.fetchone()
                if lifeguard:
                    return JsonResponse({"user_role": "lifeguard", "user_id": user_id}, status=200)

                cursor.execute("SELECT * FROM administrator WHERE administrator_id=%s", [user_id])
                admin = cursor.fetchone()
                if admin:
                    return JsonResponse({"user_role": "admin", "user_id": user_id}, status=200)

                return JsonResponse({"user_role": "non-member", "user_id": user_id}, status=200)
        else:
            return JsonResponse({"error": "Invalid username or password"}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(View):
    permission_classes = [AllowAny]

    def post(self, request):
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')  # Get email from the request
        name = data.get('name')
        surname = data.get('surname')
        password = data.get('password')
        user_type = data.get('user_type')
        
        swim_proficiency = data.get('swim_proficiency')
        gender = data.get('gender')
        pool_id = data.get('pool_id')

        # Check if the user already exists
        with connection.cursor() as cursor:
            cursor.execute("SELECT user_id FROM all_users WHERE username=%s OR email=%s", [username, email])
            existing = cursor.fetchone()

        if existing:
            return JsonResponse({"error": "User with this username or email already exists"}, status=400)

        # Insert into the `all_users` table
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO all_users (forename, surname, username, password, email, user_type)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING user_id
            """, [name, surname, username, password, email, user_type])
            new_user = cursor.fetchone()
            new_user_id = new_user[0]

        if new_user_id and user_type == "1":  # Swimmer
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO swimmer (swimmer_id, phone_number, age, gender, swimming_proficiency, number_of_booked_slots, total_courses_enrolled, total_courses_terminated, membership_status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, [new_user_id, "", 0, gender, swim_proficiency, 0, 0, 0, "nonmember"]) 
                
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO nonmember_swimmer (swimmer_id, registration_timestamp)
                    VALUES (%s, CURRENT_TIMESTAMP)
                """, [new_user_id])
                
        elif new_user_id and user_type == "3":  # Lifeguard
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO worker (worker_id, pool_id, age, gender, phone_number, qualifications, balance)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, [new_user_id, pool_id, 0, gender, "", "", 0]) 

            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO lifeguard (lifeguard_id, certifications)
                    VALUES (%s, %s)
                """, [new_user_id, ""])  

        elif new_user_id and user_type == "4":  # Coach
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO worker (worker_id, pool_id, age, gender, phone_number, qualifications, balance)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, [new_user_id, pool_id, 0, gender, "", "", 0]) 

            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO coach (coach_id, avg_rating, coach_ranking, specialties)
                    VALUES (%s, %s, %s, %s)
                """, [new_user_id, 0, 0, ""])

        elif new_user_id and user_type == "5":  # Administrator
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO administrator (administrator_id, number_of_reports)
                    VALUES (%s, %s)
                """, [new_user_id, 0]) 

        return JsonResponse({"message": "User registered successfully", "user_id": new_user_id}, status=200)

@method_decorator(csrf_exempt, name='dispatch')
class ChangePasswordView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        username = data.get('username')
        old_password = data.get('password')
        new_password = data.get('new-password')

        with connection.cursor() as cursor:
            cursor.execute("SELECT user_id FROM all_users WHERE username=%s AND password=%s", [username, old_password])
            user = cursor.fetchone()

        if user:
            with connection.cursor() as cursor:
                cursor.execute("UPDATE all_users SET password=%s WHERE username=%s", [new_password, username])
            return JsonResponse({"message": "Password updated successfully"}, status=200)
        else:
            return JsonResponse({"error": "Invalid username or old password"}, status=400)
@method_decorator(csrf_exempt, name='dispatch')
class AllCoursesView(View):
    def get(self, request):
        swimmer_id = request.GET.get('swimmer_id')  # Get swimmer ID from frontend
        if not swimmer_id:
            return JsonResponse({"error": "Swimmer ID is required"}, status=400)

        try:
            with connection.cursor() as cursor:
                # Query to fetch courses not enrolled by the swimmer
                cursor.execute("""
                    SELECT c.course_id, c.course_name, c.coach_id, c.course_description, 
                           c.date, c.start_time, c.end_time, c.restrictions, c.pool_id, 
                           c.lane_id, c.price, c.capacity,
                           COUNT(cs.swimmer_id) AS enrolled
                    FROM course c
                    LEFT JOIN course_schedule cs ON c.course_id = cs.course_id
                    WHERE c.course_id NOT IN (
                        SELECT cs.course_id
                        FROM course_schedule cs
                        WHERE cs.swimmer_id = %s
                    )
                    GROUP BY c.course_id, c.capacity
                """, [swimmer_id])

                courses = cursor.fetchall()

            # If no courses are available
            if not courses:
                return JsonResponse({"courses": []}, status=200)

            # Format course data
            course_data = [
                {
                    "course_id": course[0],
                    "course_name": course[1],
                    "coach_id": course[2],
                    "course_description": course[3],
                    "date": course[4],
                    "start_time": course[5],
                    "end_time": course[6],
                    "restrictions": course[7],
                    "pool_id": course[8],
                    "lane_id": course[9],
                    "price": course[10],
                    "registered": f"{course[12]}/{course[11]}",  # Enrolled/Capacity
                    "is_full": course[12] >= course[11]  # Check if course is full
                }
                for course in courses
            ]

            return JsonResponse({"courses": course_data}, status=200)

        except Exception as e:
            # Log error details for debugging
            print(f"Error in AllCoursesView: {e}")
            return JsonResponse({"error": "An error occurred while fetching courses.", "details": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class CurrentCoursesView(View):
    permission_classes = [AllowAny]

    def get(self, request):
        swimmer_id = request.GET.get('user_id')

        if not swimmer_id:
            return JsonResponse({"error": "User ID is required."}, status=400)

        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * 
                    FROM course 
                    WHERE course_id IN (
                        SELECT course_id 
                        FROM course_schedule 
                        WHERE swimmer_id=%s AND status=%s
                    )
                """, [swimmer_id, "in-progress"])
                courses = cursor.fetchall()

            current_course_data = []
            for course in courses:
                current_course_data.append({
                    "course_id": course[0],
                    "course_name": course[1],
                    "course_image": course[2],
                    "coach_id": course[3],
                    "course_description": course[4],
                    "restrictions": course[5],
                    "deadline": course[6],
                    "pool_id": course[7],
                    "lane_id": course[8],
                    "price": course[9],
                })

            return JsonResponse({"current_courses": current_course_data}, status=200)

        except Exception as e:
            return JsonResponse({"error": "An error occurred while fetching current courses.", "details": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')  
class PreviousCoursesView(View):
    permission_classes = [AllowAny]

    def get(self, request):
        swimmer_id = request.GET.get('user_id')

        if not swimmer_id:
            return JsonResponse({"error": "User ID is required."}, status=400)

        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * 
                    FROM course 
                    WHERE course_id IN (
                        SELECT course_id 
                        FROM course_schedule 
                        WHERE swimmer_id=%s AND (status=%s OR status=%s)
                    )
                """, [swimmer_id, "withdrawn", "finished"])
                courses = cursor.fetchall()

            previous_course_data = []
            for course in courses:
                previous_course_data.append({
                    "course_id": course[0],
                    "course_name": course[1],
                    "course_image": course[2],
                    "coach_id": course[3],
                    "course_description": course[4],
                    "restrictions": course[5],
                    "deadline": course[6],  # Ensure this is the correct index
                    "pool_id": course[7],
                    "lane_id": course[8],
                    "price": course[9],
                })

            return JsonResponse({"previous_courses": previous_course_data}, status=200)

        except Exception as e:
            return JsonResponse({"error": "An error occurred while fetching previous courses.", "details": str(e)}, status=500)

    
@method_decorator(csrf_exempt, name='dispatch')
class GetCourseView(View):
    permission_classes = [AllowAny]

    def get(self, request):
        course_id = request.GET.get('course_id')
        if not course_id:
            return JsonResponse({"error": "Course ID is required."}, status=400)

        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM course WHERE course_id=%s", [course_id])
                course = cursor.fetchone()

            if course:
                current_course_data = {
                    "course_id": course[0],
                    "course_name": course[1],
                    "course_image": course[3],
                    "coach_id": course[2],
                    "course_description": course[4],
                    "restrictions": course[5],
                    "pool_id": course[8],
                    "lane_id": course[9],
                    "price": course[10],
                }
                return JsonResponse({"course": current_course_data}, status=200)
            else:
                return JsonResponse({"error": "Course not found."}, status=404)

        except Exception as e:
            return JsonResponse({"error": "An error occurred.", "details": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class WithdrawCourseView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            swimmer_id = data.get("swimmer_id")
            course_id = data.get("course_id")
            termination_reason = data.get("termination_reason")

            # Validate input
            if not swimmer_id or not course_id or not termination_reason:
                return JsonResponse({"error": "Missing required fields."}, status=400)

            with connection.cursor() as cursor:
                # Check if the course is currently in-progress
                cursor.execute("""
                    SELECT * FROM course_schedule
                    WHERE swimmer_id = %s AND course_id = %s AND status = 'in-progress'
                """, [swimmer_id, course_id])
                course_schedule = cursor.fetchone()

                if not course_schedule:
                    return JsonResponse({"error": "No in-progress course found for the given swimmer and course."}, status=404)

                # Update the status to 'withdrawn' in the course_schedule table
                cursor.execute("""
                    UPDATE course_schedule
                    SET status = 'withdrawn', start_time = %s, end_time = %s, day = %s
                    WHERE swimmer_id = %s AND course_id = %s
                """, ['00:00:00', '00:00:00', 'N/A', swimmer_id, course_id])

                # Optionally, log the reason for termination (if you have a separate log table)
                cursor.execute("""
                    INSERT INTO withdrawal_logs (swimmer_id, course_id, termination_reason, withdrawn_at)
                    VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                """, [swimmer_id, course_id, termination_reason])

            return JsonResponse({"message": "Course withdrawn successfully."}, status=200)

        except Exception as e:
            return JsonResponse({"error": "An error occurred.", "details": str(e)}, status=500)


    
@method_decorator(csrf_exempt, name='dispatch')
class CreateCourseView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        name = data.get("courseName")
        coach_id = data.get("userId")
        description = data.get("explanation")
        restrictions = data.get("restrictions")
        date = data.get("date")
        startTime = data.get("startTime")
        endTime = data.get("endTime")
        pool_id = data.get("facility")
        lane_id = data.get("lanes")
        price = data.get("price")
        capacity = data.get("capacity")

        
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO course (course_name, coach_id, course_description, date, start_time, end_time, restrictions, pool_id, lane_id, price, capacity)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, [name, coach_id, description, date, startTime, endTime, restrictions, pool_id, lane_id[0], price, capacity])
    
        return JsonResponse({"message": "Course created successfully"}, status=201)

@method_decorator(csrf_exempt, name='dispatch')
class DeleteCourseView(View):
    permission_classes = [AllowAny]
    def delete(self, request):
        data = json.loads(request.body)
        course_id = data.get('course_id')
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM course WHERE course_id=%s", [course_id])
            
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM swimming_lesson WHERE  lesson_id=%s", [course_id])
            
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM personal_training WHERE training_id=%s", [course_id])
            
        with connection.cursor() as cursor:
            cursor.execute("UPDATE course_schedule SET status='cancelled' WHERE course_id=%s", [course_id])
        
        return JsonResponse({"message": "Course deleted successfully"}, status=200)
    
@method_decorator(csrf_exempt, name='dispatch')
class UpdateCourseView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        course_id = data.get("course_id")
        name = data.get("course_name")
        coach_id = data.get("coach_id")
        description = data.get("course_description")
        restrictions = data.get("restrictions")
        deadline = data.get("deadline")
        pool_id = data.get("pool_id")
        lane_id = data.get("lane_id")
        price = data.get("price")
        capacity = data.get("capacity")
        skill_level = data.get("skill_level")
        is_full = False
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM swimming_lesson WHERE course_id = %s", 
                        [course_id])
        course = cursor.fetchone()[0]
        
        if course:
            previous_capacity = course[1]
            if previous_capacity < capacity:
                is_full = False
            else:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT COUNT(*) as count FROM course_schedule WHERE course_id = %s", [course_id])
                course_count = cursor.fetchone()[0] | 0
                if course_count < capacity:
                    is_full = False
                else:
                    is_full = True
                
        with connection.cursor() as cursor:
            cursor.execute("UPDATE course SET course_name = %s, coach_id = %s, course_description = %s, restrictions = %s, deadline = %s, pool_id = %s, lane_id = %s, price = %s WHERE course_id = %s", 
                        [name, coach_id, description, restrictions, deadline, pool_id, lane_id, price, course_id])
            
        with connection.cursor() as cursor:
            cursor.execute("UPDATE swimming_lesson SET capacity = %s, is_full=%s, skill_level= %s WHERE lesson_id=%s", 
                        [capacity, is_full,skill_level, course_id])
            
        return JsonResponse({"message": "Course updated successfully"}, status=200)
    
@method_decorator(csrf_exempt, name='dispatch')
class EnrollCourseView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            swimmer_id = data.get("swimmer_id")
            course_id = data.get("course_id")
            
            if not swimmer_id or not course_id:
                return JsonResponse({"error": "Swimmer ID and Course ID are required."}, status=400)

            with connection.cursor() as cursor:
                # Fetch course details
                cursor.execute("SELECT price, capacity FROM course WHERE course_id = %s", [course_id])
                course = cursor.fetchone()

                if not course:
                    return JsonResponse({"error": "Course not found."}, status=404)

                price, capacity = course

                # Check swimmer's balance
                cursor.execute("SELECT total_money FROM swimmer WHERE swimmer_id = %s", [swimmer_id])
                swimmer_money = cursor.fetchone()

                if swimmer_money is None or swimmer_money[0] is None:
                    return JsonResponse({"error": "Swimmer's balance not found."}, status=400)

                total_money = swimmer_money[0]

                if total_money < price:
                    return JsonResponse({"error": "Insufficient funds."}, status=400)

                # Check if course is full
                cursor.execute("""
                    SELECT COUNT(*) FROM course_schedule WHERE course_id = %s
                """, [course_id])
                enrolled_count = cursor.fetchone()[0]

                if enrolled_count >= capacity:
                    return JsonResponse({"error": "Course is full."}, status=400)

                # Enroll swimmer and deduct balance
                cursor.execute("UPDATE swimmer SET total_money = total_money - %s WHERE swimmer_id = %s", [price, swimmer_id])
                cursor.execute("""
                    INSERT INTO course_schedule (course_id, swimmer_id, coach_id, start_time, end_time, status, day)
                    SELECT course_id, %s, coach_id, start_time, end_time, 'in-progress', 'Monday'
                    FROM course
                    WHERE course_id = %s
                """, [swimmer_id, course_id])

            return JsonResponse({"message": "Successfully enrolled in the course."}, status=201)

        except Exception as e:
            # Log the exception
            print(f"Error in EnrollCourseView: {e}")
            return JsonResponse({"error": "Enrollment failed.", "details": str(e)}, status=500)
    
@method_decorator(csrf_exempt, name='dispatch')
class CoachRatingView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        coach_id = request.GET.get("coach_id")
               
        with connection.cursor() as cursor:
            cursor.execute("SELECT AVG(rating) FROM rating WHERE coach_id=%s", [coach_id])
            avg_rating = cursor.fetchone()
        
        return JsonResponse({"coach_id": coach_id, "avg_rating": avg_rating or 0.0}, status=200)
@method_decorator(csrf_exempt, name='dispatch')
class AddRatingView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        coach_id = data.get("coach_id")
        swimmer_id = data.get("swimmer_id")
        course_id = data.get("course_id")
        rating = data.get("rating")
        
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO rating (swimmer_id, coach_id, course_id, rating) VALUES (%s, %s, %s)",
                [swimmer_id, coach_id, course_id, rating])
        
        return JsonResponse({"message": "Rating added successfully"}, status=200)
    
@method_decorator(csrf_exempt, name='dispatch')
class UpdateRatingView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        coach_id = data.get("coach_id")
        swimmer_id = data.get("swimmer_id")
        course_id = data.get("course_id")
        rating = data.get("rating")
        
        with connection.cursor() as cursor:
            cursor.execute("UPDATE rating SET rating=%s WHERE course_id=%s AND coach_id=%s AND swimmer_id=%s",
                [rating, course_id, coach_id, swimmer_id])
        return JsonResponse({"message": "Rating updated successfully"}, status=200)
    
@method_decorator(csrf_exempt, name='dispatch')
class CourseCommentsView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        course_id = request.GET.get("course_id")

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM comment WHERE course_id = %s",
                [course_id],
            )
            comments = cursor.fetchall()
            
        comments_data=[]
        for comment in comments:
            course_comments = {
                    "comment_id": comment[0],
                    "swimmer_id": comment[1],
                    "coach_id": comment[2],
                    "course_id": comment[3],
                    "comment": comment[4],
                    "created_at": comment[5],
                }
            comments_data.append(course_comments)
        return JsonResponse({"course_comments": comments_data}, status=200)
        
@method_decorator(csrf_exempt, name='dispatch')
class AddCourseCommentView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        coach_id = data.get("coach_id")
        swimmer_id = data.get("swimmer_id")
        course_id = data.get("course_id")
        rating = data.get("comment")
        
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO comment (swimmer_id, coach_id, course_id, comment, created_at) VALUES (%s, %s, %s)",
                [swimmer_id, coach_id, course_id, rating])
        
        return JsonResponse({"message": "Comment added successfully"}, status=200)

@method_decorator(csrf_exempt, name='dispatch')
class PoolsView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM swimming_pool")
            pools = cursor.fetchall()
        
        pools_data = []
        for pool in pools:
            pool_data = {
                        "pool_id": pool[0],
                        "number_of_lanes": pool[1],
                        "opening_hours": pool[2],
                        "closing_hours": pool[3],
                        "working_days": pool[4],
                        "location": pool[5]
                        }
            pools_data.append(pool_data)
        return JsonResponse({"pools": pools_data})

@method_decorator(csrf_exempt, name='dispatch')
class AllLanesView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        pool_id = request.GET.get("pool_id")
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM lane WHERE pool_id=%s", [pool_id])
            lanes = cursor.fetchall()

        all_lanes = []
        for lane in lanes:
            lane = {
                    "lane_id": lane[0],
                    "pool_id": lane[1],
                    "lane_number": lane[2],
                    "lifeguard_id": lane[3],
                    "start_time": lane[4],
                    "end_time": lane[5],
                    "availability": lane[6]
                    }
            all_lanes.append(lane)
        return JsonResponse({"lanes": all_lanes})
        
@method_decorator(csrf_exempt, name='dispatch')
class AvailableLanes(View):
    permission_classes = [AllowAny]
    def get(self, request):
        pool_id = request.GET.get("pool_id")
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM lane WHERE pool_id=%s AND availability=%s", [pool_id, "available"])
            lanes = cursor.fetchall()

        available_lanes = []
        for lane in lanes:
            lane = {
                    "lane_id": lane[0],
                    "pool_id": lane[1],
                    "lane_number": lane[2],
                    "lifeguard_id": lane[3],
                    "start_time": lane[4],
                    "end_time": lane[5],
                    "availability": lane[6]
                    }
            available_lanes.append(lane)
        return JsonResponse({"lanes": available_lanes})

@method_decorator(csrf_exempt, name='dispatch')
class BookLaneView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        swimmer_id = data.get("swimmer_id")
        lane_id = data.get("lane_id")
        start_time = data.get("start_time")
        end_time = data.get("end_time")
        status = data.get("status")
        
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO private_booking (swimmer_id, lane_id, start_time, end_time) VALUES (%s, %s, %s, %s)",
                [swimmer_id, lane_id, start_time, end_time, status]
            )
        
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE lane SET availability=%s WHERE lane_id=%s",
                ["in-use", lane_id]
            )
            
            cursor.execute(
                "DELETE FROM cart WHERE purchaser_id = %s AND lane_id = %s",
                [swimmer_id, lane_id],
            )
            
            cursor.execute("SELECT * FROM lane HERE lane_id=%s", [lane_id])
            lane = cursor.fetchone()
            booking_price = lane[6]
            
            cursor.execute("UPDATE swimmer SET total_money = total_money - %s WHERE user_id = %s", [booking_price, swimmer_id])
            
            cursor.execute(
                "INSERT INTO buying_history(purchaser_id, course_id, cafe_item_id, cafe_id, lane_id, purchased_at) VALUES(%s, %s, %s, %s, %s, %s, %s)",
                [swimmer_id, 0, 0, 0, lane_id, datetime.now],
            )
            
        return JsonResponse({"message": "Lane booked successfully"})
    
@method_decorator(csrf_exempt, name='dispatch')
class UsersView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM all_users")
            users = cursor.fetchall()
        
        all_users = []
        for user in users:
            user_data = {
                    "user_id": user[0],
                    "user_image": user[1],
                    "forename": user[2],
                    "surname": user[3],
                    "username": user[4],
                    "password": user[5],
                    "user_type": user[6]
                    }
            all_users.append(user_data)
        return JsonResponse({"users": all_users})

@method_decorator(csrf_exempt, name='dispatch')
class AllSwimmersView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM swimmer")
            swimmers = cursor.fetchall()
        
        all_swimmers = []
        for swimmer in swimmers:
            user_data = {
                    "swimmer_id": swimmer[0],
                    "phone_number": swimmer[1],
                    "age": swimmer[2],
                    "gender": swimmer[3],
                    "swimming_proficiency": swimmer[4],
                    "number_of_booked_slots": swimmer[5],
                    "total_courses_enrolled": swimmer[6],
                    "total_courses_terminated": swimmer[7],
                    "membership_status": swimmer[8],
                    }
            all_swimmers.append(user_data)
        return JsonResponse({"swimmers": all_swimmers})
    


@method_decorator(csrf_exempt, name='dispatch')
class GetUserView(View):
    permission_classes = [AllowAny]

    def get(self, request):
        user_id = request.GET.get('user_id')  # Get user_id from the query parameters
        if not user_id:
            return JsonResponse({"error": "User ID is required."}, status=400)

        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        user_id, 
                        user_image, 
                        forename, 
                        surname, 
                        username, 
                        password, 
                        user_type,
                        email 
                    FROM all_users 
                    WHERE user_id = %s
                """, [user_id])  # Query the correct table and column
                user = cursor.fetchone()

            if user:
                # Convert binary data (e.g., `user_image`) to Base64 if it exists
                user_image = (
                    base64.b64encode(user[1]).decode('utf-8') 
                    if user[1] is not None else None
                )

                user_data = {
                    "user_id": user[0],
                    "user_image": user_image,
                    "forename": user[2],
                    "surname": user[3],
                    "username": user[4],
                    "password": user[5],
                    "user_type": user[6],
                    "email": user[7],
                }
                return JsonResponse({"user": user_data}, status=200)
            else:
                return JsonResponse({"error": "User not found."}, status=404)
        except Exception as e:
            return JsonResponse({"error": "An error occurred.", "details": str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class CreateUserView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        username = data.get('username')
        name = data.get('forename')
        surname = data.get('surname')
        password = data.get('password')
        user_type = data.get('user-type')

        with connection.cursor() as cursor:
            cursor.execute("SELECT user_id FROM all_users WHERE username=%s", [username])
            existing = cursor.fetchone()

        if existing:
            return JsonResponse({"error":"User already exists"}, status=400)

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO all_users (forename, surname, username, password, user_type)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING user_id
            """, [name, surname, username, password, user_type])
            new_user_id = cursor.fetchone()[0]

        if new_user_id and user_type == "1":  # Swimmer
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO swimmer (swimmer_id, phone_number, age, gender, swimming_proficiency, number_of_booked_slots, total_courses_enrolled, total_courses_terminated)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, [new_user_id, "", 0, "", "", 0, 0, 0]) 
                
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO nonmember_swimmer (swimmer_id, registration_timestamp)
                    VALUES (%s, CURRENT_TIMESTAMP)
                """, [new_user_id])
                
        elif new_user_id and  user_type == "3":  # Lifeguard
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO worker (worker_id, pool_id, salary, age, gender, phone_number, swim_proficiency, qualifications)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, [new_user_id, 0, 0, 0, "", "", "", ""])

            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO lifeguard (lifeguard_id, certifications)
                    VALUES (%s, %s)
                """, [new_user_id, ""])  

        elif new_user_id and user_type == "4":  # Coach
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO worker (worker_id, pool_id, salary, age, gender, phone_number, swim_proficiency, qualifications)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, [new_user_id, 0, 0, 0, "", "", "", ""]) 

            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO coach (coach_id, avg_rating, coach_ranking, specialties)
                    VALUES (%s, %s, %s, %s)
                """, [new_user_id, 0, 0, ""])

        elif new_user_id and  user_type == "5":  # Administrator
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO administrator (administrator_id, number_of_reports)
                    VALUES (%s, %s)
                """, [new_user_id, 0]) 

        return JsonResponse({"message": "User registered successfully", "user_id": new_user_id}, status=201)

@method_decorator(csrf_exempt, name='dispatch')
class DeleteUserView(View):
    permission_classes = [AllowAny]
    def delete(self, request):
        user_id = request.GET.get('user_id')
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM all_users WHERE user_id = %s", [user_id])
            user_type = cursor.fetchone()[6]
            
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM all_users WHERE user_id = %s", [user_id])
            
        if(user_type == "1"):
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM swimmer WHERE swimmer_id = %s", [user_id])
                
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM nonmember_swimmer WHERE swimmer_id = %s", [user_id])
            
        elif(user_type == "2"):
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM swimmer WHERE swimmer_id = %s", [user_id])
            
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM member_swimmer WHERE swimmer_id = %s", [user_id])
            
        elif(user_type == "3"):
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM worker WHERE worker_id = %s", [user_id])
                
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM lifeguard WHERE lifeguard_id = %s", [user_id])
             
        elif(user_type == "4"):
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM worker WHERE worker_id = %s", [user_id])
            
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM coach WHERE coach_id = %s", [user_id])
                
        else: #(user_type == "5")
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM administrator WHERE administrator_id = %s", [user_id])
                
        return JsonResponse({"message": "User deleted successfully"})

@method_decorator(csrf_exempt, name='dispatch')
class UpdateMemberProfileView(View):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data = json.loads(request.body)

            # Extract required fields
            user_id = data.get("user_id")
            if not user_id:
                return JsonResponse({"error": "User ID is required."}, status=400)

            # Data for `all_users` table
            user_image = data.get("user_image")
            forename = data.get("forename")
            surname = data.get("surname")
            username = data.get("username")
            password = data.get("password")
            email = data.get("email")

            # Data for `swimmer` table
            total_money = data.get("total_money")
            swim_proficiency = data.get("swim_proficiency")
            number_of_booked_slots = data.get("number_of_booked_slots")
            total_courses_enrolled = data.get("total_courses_enrolled")
            total_courses_terminated = data.get("total_courses_terminated")
            membership_status = data.get("membership_status")
            age = data.get("age")
            gender = data.get("gender")
            phone_number = data.get("phone_number")

            # Data for `member_swimmer` table
            points = data.get("points")
            monthly_payment_amount = data.get("monthly_payment")
            number_of_personal_training_hours = data.get("number_of_personal_training_hours")
            ranking = data.get("ranking")
            number_of_items_purchased = data.get("number_of_items_purchases")

            # Check if member exists in `member_swimmer` table
            with connection.cursor() as cursor:
                cursor.execute("SELECT swimmer_id FROM member_swimmer WHERE swimmer_id=%s", [user_id])
                member_exists = cursor.fetchone()

            if not member_exists:
                return JsonResponse({"error": "Member does not exist in member_swimmer table."}, status=404)

            # Update `all_users` table
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE all_users 
                    SET user_image=%s, forename=%s, surname=%s, username=%s, password=%s, email=%s
                    WHERE user_id=%s
                    """,
                    [user_image, forename, surname, username, password, email, user_id]
                )

            # Update `swimmer` table
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE swimmer 
                    SET phone_number=%s, age=%s, gender=%s, swimming_proficiency=%s, 
                        number_of_booked_slots=%s, total_courses_enrolled=%s, 
                        total_courses_terminated=%s, membership_status=%s, total_money=%s
                    WHERE swimmer_id=%s
                    """,
                    [
                        phone_number, age, gender, swim_proficiency, 
                        number_of_booked_slots, total_courses_enrolled, 
                        total_courses_terminated, membership_status, total_money, user_id
                    ]
                )

            # Update `member_swimmer` table
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE member_swimmer 
                    SET points=%s, monthly_payment_amount=%s, 
                        number_of_personal_training_hours=%s, ranking=%s, 
                        number_of_items_purchased=%s
                    WHERE swimmer_id=%s
                    """,
                    [
                        points, monthly_payment_amount, 
                        number_of_personal_training_hours, ranking, 
                        number_of_items_purchased, user_id
                    ]
                )

            return JsonResponse({"message": "Member profile updated successfully."}, status=200)

        except Exception as e:
            return JsonResponse({"error": "An error occurred while updating the profile.", "details": str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class UpdateNonmemberProfileView(View):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data = json.loads(request.body)
            user_id = data.get("user_id")
            user_image_base64 = data.get("user_image")

            if user_image_base64:
                user_image = base64.b64decode(user_image_base64)
            else:
                user_image = None

            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE all_users
                    SET user_image=%s, forename=%s, surname=%s, username=%s, password=%s, email=%s
                    WHERE user_id=%s
                    """,
                    [
                        user_image,
                        data.get("forename"),
                        data.get("surname"),
                        data.get("username"),
                        data.get("password"),
                        data.get("email"),
                        user_id,
                    ],
                )
            return JsonResponse({"message": "Profile updated successfully."}, status=200)
        except Exception as e:
            return JsonResponse(
                {"error": "An error occurred while updating the profile.", "details": str(e)},
                status=500,
            )

    
@method_decorator(csrf_exempt, name='dispatch')
class UpdateCoachProfileView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        user_id = data.get("user_id")
        user_image = data.get("user_image")
        forename = data.get('forename')
        surname = data.get('surname')
        username = data.get('username')
        password = data.get('password')
        balance = data.get("balance")
        pool_id = data.get("pool_id")
        salary = data.get("salary")
        age = data.get("age")
        gender = data.get("gender")
        phone_number = data.get("phone_number")
        swim_proficiency = data.get("swim_proficiency")
        qualifications = data.get("qualifications")
        avg_rating = data.get("avg_rating")
        coach_ranking = data.get("coach_ranking")
        specialties = data.get("specialties")
        
       
        with connection.cursor() as cursor:
            cursor.execute("UPDATE all_users SET user_image=%s, forename=%s, surname=%s, username=%s, password=%s WHERE user_id=%s",
                            [user_image, forename, surname, username, password, user_id])
                
        with connection.cursor() as cursor:
            cursor.execute("UPDATE worker SET pool_id=%s, salary=%s, age=%s, gender=%s, phone_number=%s, swimming_proficiency=%s, qualifications=%s, balance=%s WHERE worker_id=%s",
                            [pool_id, salary, age, gender, phone_number, swim_proficiency, qualifications, balance, user_id])
            
        with connection.cursor() as cursor:
            cursor.execute("UPDATE coach SET avg_rating=%s, coach_ranking=%s, specialties=%s WHERE coach_id=%s",
                            [avg_rating, coach_ranking, specialties])
        
        return JsonResponse({"message": "Coach updated successfully"})
    
@method_decorator(csrf_exempt, name='dispatch')
class UpdateLifeguardProfileView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        user_id = data.get("user_id")
        user_image = data.get("user_image")
        forename = data.get('forename')
        surname = data.get('surname')
        username = data.get('username')
        password = data.get('password')
        balance = data.get("balance")
        pool_id = data.get("pool_id")
        salary = data.get("salary")
        age = data.get("age")
        gender = data.get("gender")
        phone_number = data.get("phone_number")
        swim_proficiency = data.get("swim_proficiency")
        qualifications = data.get("qualifications")
        certifications = data.get("certifications")
        
        with connection.cursor() as cursor:
            cursor.execute("UPDATE all_users SET user_image=%s, forename=%s, surname=%s, username=%s, password=%s WHERE user_id=%s",
                            [user_image, forename, surname, username, password, user_id])
                
        with connection.cursor() as cursor:
            cursor.execute("UPDATE worker SET pool_id=%s, salary=%s, age=%s, gender=%s, phone_number=%s, swimming_proficiency=%s, qualifications=%s, balance=%s WHERE worker_id=%s",
                            [pool_id, salary, age, gender, phone_number, swim_proficiency, qualifications, balance, user_id])
            
        with connection.cursor() as cursor:
            cursor.execute("UPDATE lifeguard SET certifications=%s WHERE lifeguard_id=%s",
                            [certifications])
        
        return JsonResponse({"message": "Lifeguard updated successfully"})
        
@method_decorator(csrf_exempt, name='dispatch')
class UpdateAdministratorProfileView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        user_id = data.get("user_id")
        user_image = data.get("user_image")
        forename = data.get('forename')
        surname = data.get('surname')
        username = data.get('username')
        password = data.get('password')
        number_of_reports = data.get("number_of_reports")
        
        with connection.cursor() as cursor:
            cursor.execute("UPDATE all_users SET user_image=%s, forename=%s, surname=%s, username=%s, password=%s, WHERE user_id=%s",
                        [user_image, forename, surname, username, password, user_id])
                
        with connection.cursor() as cursor:
            cursor.execute("UPDATE administrator SET number_of_reports=%s WHERE administrator_id=%s",
                        [number_of_reports, user_id])
        
        return JsonResponse({"message": "Admin updated successfully"})
    

        
@method_decorator(csrf_exempt, name='dispatch')
class GetMemberSwimmerView(View):
    permission_classes = [AllowAny]

    def get(self, request):
        # Extract user_id (swimmerId in frontend) from the request
        user_id = request.GET.get('user_id')

        if not user_id:
            return JsonResponse({"error": "User ID is required."}, status=400)

        try:
            # Fetch member details from the database
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT swimmer_id, points, monthly_payment_amount, 
                           number_of_personal_training_hours, ranking, number_of_items_purchased
                    FROM member_swimmer 
                    WHERE swimmer_id = %s
                    """,
                    [user_id]
                )
                user = cursor.fetchone()

            # If member is found, return their details
            if user:
                user_data = {
                    "swimmer_id": user[0],
                    "points": user[1],
                    "monthly_payment_amount": user[2],
                    "number_of_personal_training_hours": user[3],
                    "ranking": user[4],
                    "number_of_items_purchased": user[5],
                }
                return JsonResponse({"member": user_data}, status=200)
            else:
                return JsonResponse({"error": "Member not found."}, status=404)

        except Exception as e:
            return JsonResponse(
                {"error": "An error occurred while fetching member details.", "details": str(e)},
                status=500
            )

@method_decorator(csrf_exempt, name='dispatch')
class GetNonmemberSwimmerView(View):
    def get(self, request):
        # Get the `user_id` from the request's query parameters
        user_id = request.GET.get('swimmer_id')

        # If `user_id` is not provided, return an error response
        if not user_id:
            return JsonResponse({"error": "User ID is required."}, status=400)

        try:
            # Query the database to get user details
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT user_id, user_image, forename, surname, username, password, email, total_money
                    FROM all_users, swimmer
                    WHERE user_id = %s
                    """,
                    [user_id]
                )
                user_data = cursor.fetchone()

            # Check if user data is retrieved
            if user_data:
                # Convert the `BYTEA` image into Base64 format (if it exists)
                user_image_base64 = None
                if user_data[1]:  # Check if `user_image` is not NULL
                    user_image_base64 = base64.b64encode(user_data[1]).decode('utf-8')

                # Construct a dictionary with user details
                user_details = {
                    "user_id": user_data[0],
                    "user_image": user_image_base64,  # Base64 encoded image
                    "forename": user_data[2],
                    "surname": user_data[3],
                    "username": user_data[4],
                    "password": user_data[5],
                    "email": user_data[6],
                    "total_money": user_data[7]
                }

                # Return user details as JSON
                return JsonResponse({"user": user_details}, status=200)
            else:
                return JsonResponse({"error": "User not found."}, status=404)

        except Exception as e:
            # Handle exceptions and return an error message
            return JsonResponse(
                {"error": "An error occurred while fetching user details.", "details": str(e)},
                status=500
            )

@csrf_exempt
def upload_profile_picture(request):
    if request.method == 'POST':
        try:
            user_id = request.POST.get('user_id')
            profile_picture = request.FILES.get('profilePicture')

            if not user_id or not profile_picture:
                return JsonResponse({"error": "User ID and profile picture are required."}, status=400)

            # Convert the uploaded file to base64
            profile_picture_data = profile_picture.read()

            # Update the database
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE all_users
                    SET user_image = %s
                    WHERE user_id = %s
                    """,
                    [profile_picture_data, user_id]
                )

            return JsonResponse({"message": "Profile picture updated successfully."}, status=200)

        except Exception as e:
            return JsonResponse({"error": "Failed to upload profile picture.", "details": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method."}, status=405)

    
@method_decorator(csrf_exempt, name='dispatch')
class GetCoachView(View):
    permission_classes = [AllowAny]

    def get(self, request):
        user_id= request.GET.get('userId')
        if not user_id:
            return JsonResponse({"error": "User id is required"}, status=400)

        with connection.cursor() as cursor:
            cursor.execute("SELECT user_id FROM all_users WHERE user_id= %s", [user_id])
            user = cursor.fetchone()

        with connection.cursor() as cursor:
            cursor.execute("SELECT balance FROM worker WHERE worker_id = %s", [user[0]])
            balance = cursor.fetchone()[0]      
        
        
        if user:
            user_id = user[0]

            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM coach WHERE coach_id = %s", [user_id])
                coach = cursor.fetchone()

            if coach:
                coach_data = {
                    "coach_id": coach[0],
                    "avg_rating": coach[1],
                    "coach_ranking": coach[2],
                    "specialties": coach[3],
                    "balance": balance,
                }

                return JsonResponse({"coach": coach_data})
            else:
                return JsonResponse({"error": "Coach not found"}, status=404)
        else:
            return JsonResponse({"error": "User not found"}, status=404)
        
    
@method_decorator(csrf_exempt, name='dispatch')
class GetLifeguardView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        lifeguard_id = request.GET.get('lifeguard_id')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM lifeguard WHERE lifeguard_id = %s", [lifeguard_id])
            user = cursor.fetchone()

        if user:
            user_data = {
                "lifeguard_id": user[0],
                "certifications": user[1],
            }
            return JsonResponse({"lifeguard": user_data})
        else:
            return JsonResponse({"error": "Lifeguard not found"}, status=404)
    
@method_decorator(csrf_exempt, name='dispatch')
class GetAdministratorView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        admin_id = request.GET.get('admin_id')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM administrator WHERE administrator_id = %s", [admin_id])
            user = cursor.fetchone()

        if user:
            user_data = {
                "administrator_id": user[0],
                "number_of_reports": user[1],
            }
            return JsonResponse({"admin": user_data})
        else:
            return JsonResponse({"error": "Admin not found"}, status=404)

@method_decorator(csrf_exempt, name='dispatch')
class BecomeMemberView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        user_id = data.get('user_id')
        
        with connection.cursor() as cursor:
            cursor.execute("UPDATE all_users SET user_type = '2' WHERE user_id = %s", [user_id])
            cursor.execute("UPDATE swimmer SET membership_status = 'member' WHERE swimmer_id = %s", [user_id])
            cursor.execute("INSERT INTO member_swimmer (swimmer_id, points, monthly_payment_amount, number_of_personal_training_hours, ranking, number_of_items_purchased) VALUES (%s, 0, 0, 0, 0, 0)", [user_id])
            cursor.execute("DELETE FROM nonmember_swimmer WHERE swimmer_id = %s", [user_id])
        
        request.session.flush() 
        return JsonResponse({"message": "User has become a member successfully"}, status=200)

@method_decorator(csrf_exempt, name='dispatch')
class CancelMembershipView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        user_id = data.get('user_id')
        
        with connection.cursor() as cursor:
            cursor.execute("UPDATE all_users SET user_type = '1' WHERE user_id = %s", [user_id])
            cursor.execute("UPDATE swimmer SET membership_status = 'nonmember' WHERE swimmer_id = %s", [user_id])
            cursor.execute("INSERT INTO nonmember_swimmer (swimmer_id) VALUES (%s)", [user_id])
            cursor.execute("DELETE FROM member_swimmer WHERE swimmer_id = %s", [user_id])
        
        request.session.flush() 
        return JsonResponse({"message": "Membership canceled successfully"}, status=200)

@method_decorator(csrf_exempt, name='dispatch')
class DailyCoursesCoachView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        coach_id = request.GET.get('coach_id')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM course WHERE course_id IN (SELECT * FROM course_schedule WHERE coach_id = %s AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE AND EXTRACT(DOW FROM CURRENT_DATE) = day AND status='in-progress')", [coach_id])
            courses = cursor.fetchall()
            
        course_data = []
        for course in courses:    
            course = {
                        "course_id": course[0],
                        "course_name": course[1],
                        "course_image": course[2],
                        "coach_id": course[3],
                        "course_description": course[4],
                        "restrictions": course[5],
                        "deadline": course[6],
                        "pool_id": course[7],
                        "lane_id": course[8],
                        "price": course[9]
                    }
            course_data.append(course)
            
        return JsonResponse({"daily_courses": course_data})

@method_decorator(csrf_exempt, name='dispatch')
class DailyCoursesMemberView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        member_id = request.GET.get('member_id')
        with connection.cursor() as cursor:
            cursor.execute(
                  cursor.execute("SELECT * FROM course WHERE  course_id IN (SELECT * FROM course_schedule WHERE swimmer_id = %s AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE  AND EXTRACT(DOW FROM CURRENT_DATE)= day AND status='in-progress'", [member_id])
                [member_id],
            )
            courses = cursor.fetchall()

        course_data = [
            {
                "course_id": course[0],
                "course_name": course[1],
                "course_image": course[2],
                "coach_id": course[3],
                "course_description": course[4],
                "restrictions": course[5],
                "deadline": course[6],
                "pool_id": course[7],
                "lane_id": course[8],
                "price": course[9]
            }
            for course in courses
        ]
        return JsonResponse({"daily_courses": course_data})
    
@method_decorator(csrf_exempt, name='dispatch')
class WeeklyCoursesCoachView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        coach_id = request.GET.get('coach_id')
        today = datetime.today()
        start_of_week = today - datetime.timedelta(days=today.weekday()) 
        end_of_week = start_of_week + datetime.timedelta(days=6) 
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM course WHERE course_id IN (SELECT course_id FROM course_schedule WHERE coach_id = %s AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE AND day BETWEEN %s AND %s AND status='in-progress)", 
                           [coach_id, start_of_week.date(), end_of_week.date()])
            courses = cursor.fetchall()

        course_data = [
            {
                "course_id": course[0],
                "course_name": course[1],
                "course_image": course[2],
                "coach_id": course[3],
                "course_description": course[4],
                "restrictions": course[5],
                "deadline": course[6],
                "pool_id": course[7],
                "lane_id": course[8],
                "price": course[9]
            }
            for course in courses
        ]
        return JsonResponse({"weekly_courses": course_data})
    
@method_decorator(csrf_exempt, name='dispatch')
class WeeklyCoursesMemberView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        member_id = request.GET.get('member_id')
        today = datetime.today()
        start_of_week = today - datetime.timedelta(days=today.weekday()) 
        end_of_week = start_of_week + datetime.timedelta(days=6) 

        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM course WHERE course_id IN (SELECT course_id FROM course_schedule WHERE swimmer_id = %s AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE AND day BETWEEN %s AND %s AND status='in-progress)", 
                           [member_id, start_of_week.date(), end_of_week.date()])
            courses = cursor.fetchall()

        course_data = []
        for course in courses:
            course= {
                "course_id": course[0],
                "course_name": course[1],
                "course_image": course[2],
                "coach_id": course[3],
                "course_description": course[4],
                "restrictions": course[5],
                "deadline": course[6],
                "pool_id": course[7],
                "lane_id": course[8],
                "price": course[9]
                }
            course_data.append(course)
           
        return JsonResponse({"weekly_courses": course_data})

@method_decorator(csrf_exempt, name='dispatch')
class DailyCoursesNonmemberView(View):
    def get(self, request):
        swimmer_id = request.GET.get('nonmember_id')
        if not swimmer_id:
            logger.error("Nonmember ID is missing.")
            return JsonResponse({"error": "Nonmember ID is required."}, status=400)

        try:
            with connection.cursor() as cursor:
                logger.info(f"Fetching daily courses for nonmember_id: {swimmer_id}")
                cursor.execute("""
                    SELECT cs.course_id, c.course_name, c.coach_id, c.course_description, 
                           c.restrictions, c.date, c.start_time, c.end_time, 
                           c.pool_id, c.lane_id, c.price
                    FROM course_schedule cs
                    JOIN course c ON cs.course_id = c.course_id
                    WHERE cs.swimmer_id = %s
                      AND c.date = CURRENT_DATE
                      AND cs.status = 'in-progress'
                      AND cs.day = CASE
                          WHEN EXTRACT(DOW FROM CURRENT_DATE) = 0 THEN 'Sunday'
                          WHEN EXTRACT(DOW FROM CURRENT_DATE) = 1 THEN 'Monday'
                          WHEN EXTRACT(DOW FROM CURRENT_DATE) = 2 THEN 'Tuesday'
                          WHEN EXTRACT(DOW FROM CURRENT_DATE) = 3 THEN 'Wednesday'
                          WHEN EXTRACT(DOW FROM CURRENT_DATE) = 4 THEN 'Thursday'
                          WHEN EXTRACT(DOW FROM CURRENT_DATE) = 5 THEN 'Friday'
                          WHEN EXTRACT(DOW FROM CURRENT_DATE) = 6 THEN 'Saturday'
                          ELSE NULL
                      END
                """, [swimmer_id])
                courses = cursor.fetchall()
                logger.info(f"Courses fetched: {courses}")

            if not courses:
                logger.warning("No courses found for the specified nonmember.")
                return JsonResponse({"daily_courses": []}, status=200)

            course_data = [
                {
                    "course_id": course[0],
                    "course_name": course[1],
                    "coach_id": course[2],
                    "course_description": course[3],
                    "restrictions": course[4],
                    "date": course[5],
                    "start_time": course[6],
                    "end_time": course[7],
                    "pool_id": course[8],
                    "lane_id": course[9],
                    "price": course[10],
                }
                for course in courses
            ]
            return JsonResponse({"daily_courses": course_data}, status=200)

        except Exception as e:
            logger.error(f"Error fetching daily courses: {e}")
            return JsonResponse({"error": "An error occurred while fetching courses.", "details": str(e)}, status=500)
        
@method_decorator(csrf_exempt, name='dispatch')
class WeeklyCoursesNonmemberView(View):
    def get(self, request):
        try:
            nonmember_id = request.GET.get('nonmember_id')
            if not nonmember_id:
                return JsonResponse({"error": "Nonmember ID is required."}, status=400)

            today = datetime.now().date()
            start_of_week = today - timedelta(days=today.weekday())
            end_of_week = start_of_week + timedelta(days=6)

            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT c.course_id, c.course_name, c.coach_id, 
                           c.course_description, c.restrictions, c.date, 
                           c.start_time, c.end_time, c.pool_id, c.lane_id, c.price, 
                           cs.day
                    FROM course_schedule cs
                    INNER JOIN course c ON cs.course_id = c.course_id
                    WHERE cs.swimmer_id = %s
                      AND cs.status = 'in-progress'
                      AND c.date BETWEEN %s AND %s
                """, [nonmember_id, start_of_week, end_of_week])

                courses = cursor.fetchall()

            if not courses:
                return JsonResponse({"weekly_courses": []}, status=200)

            course_data = [
                {
                    "course_id": course[0],
                    "course_name": course[1],
                    "coach_id": course[2],
                    "course_description": course[3],
                    "restrictions": course[4],
                    "date": course[5],
                    "start_time": course[6],
                    "end_time": course[7],
                    "pool_id": course[8],
                    "lane_id": course[9],
                    "price": course[10],
                    "day": course[11]
                }
                for course in courses
            ]

            return JsonResponse({"weekly_courses": course_data}, status=200)

        except Exception as e:
            print(f"Error in WeeklyCoursesNonmemberView: {str(e)}")
            return JsonResponse({"error": "An error occurred while fetching weekly courses.", "details": str(e)}, status=500)

    
@method_decorator(csrf_exempt, name='dispatch')
class CoursesNonmemberView(View):
    permission_classes = [AllowAny]

    def get(self, request):
        nonmember_id = request.GET.get('nonmember_id')

        if not nonmember_id:
            return JsonResponse({"error": "Nonmember ID is required."}, status=400)

        try:
            today = datetime.today().date()

            # Upcoming courses
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT c.course_id, c.course_name, c.course_description, c.restrictions, c.date,
                           c.pool_id, c.lane_id, c.price, cs.day, cs.start_time, cs.end_time
                    FROM course c
                    JOIN course_schedule cs ON c.course_id = cs.course_id
                    WHERE cs.swimmer_id = %s AND c.date > %s AND cs.status = 'in-progress'
                """, [nonmember_id, today])
                upcoming_courses = cursor.fetchall()

            upcoming_data = [
                {
                    "course_id": course[0],
                    "course_name": course[1],
                    "course_description": course[2],
                    "restrictions": course[3],
                    "date": course[4],
                    "pool_id": course[5],
                    "lane_id": course[6],
                    "price": course[7],
                    "day": course[8],
                    "start_time": course[9],
                    "end_time": course[10],
                }
                for course in upcoming_courses
            ]

            # Previous courses
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT c.course_id, c.course_name, c.course_description, c.restrictions, c.date,
                           c.pool_id, c.lane_id, c.price, cs.day, cs.start_time, cs.end_time
                    FROM course c
                    JOIN course_schedule cs ON c.course_id = cs.course_id
                    WHERE cs.swimmer_id = %s AND c.date <= %s AND cs.status = 'finished'
                """, [nonmember_id, today])
                previous_courses = cursor.fetchall()

            previous_data = [
                {
                    "course_id": course[0],
                    "course_name": course[1],
                    "course_description": course[2],
                    "restrictions": course[3],
                    "date": course[4],
                    "pool_id": course[5],
                    "lane_id": course[6],
                    "price": course[7],
                    "day": course[8],
                    "start_time": course[9],
                    "end_time": course[10],
                }
                for course in previous_courses
            ]

            return JsonResponse({"upcoming_courses": upcoming_data, "previous_courses": previous_data}, status=200)

        except Exception as e:
            return JsonResponse({"error": "An error occurred while fetching courses.", "details": str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class CafeItemsView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM cafe_items")
            items = cursor.fetchall()
        
        item_data = []
        for item in items:
            cafe_item={
                "cafe_item_id": item[0],
                "cafe_id": item[1],
                "item_image": item[2],
                "item_name": item[3],
                "item_description": item[4],
                "item_count": item[5],
                "price": item[6]
            } 
            item_data.append(cafe_item)
        return JsonResponse({"cafe_items": item_data})


@method_decorator(csrf_exempt, name='dispatch')
class CafeItemView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        cafe_item_id = request.GET.get('cafe_item_id')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM cafe_item WHERE cafe_item_id=%s", [cafe_item_id])
            item = cursor.fetchone()
        
        item_data = {
            "cafe_item_id": item[0],
            "cafe_id": item[1],
            "item_image": item[2],
            "item_name": item[3],
            "item_description": item[4],
            "item_count": item[5],
            "price": item[6]
        }
        return JsonResponse({"cafe_item": item_data})

@method_decorator(csrf_exempt, name='dispatch')
class CartItemsView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        user_id = request.GET.get('user_id')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM cart WHERE user_id=%s", [user_id])
            items = cursor.fetchall()
        
        cart_data = []
        for item in items:
            cart_item={
                "cart_id": item[0],
                "purchaser_id": item[1],
                "course_id": item[2],
                "cafe_item_id": item[3],
                "lane_id": item[4],
                "quantity": item[5]
            } 
            cart_data.append(cart_item)
        return JsonResponse({"cart_items": cart_data})

@method_decorator(csrf_exempt, name='dispatch')
class CoachCoursesView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        coach_id = request.GET.get('coach_id')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM course WHERE coach_id=%s", [coach_id])
            courses = cursor.fetchall()
        
        course_data = []
        for course in courses:
            course= {
                "course_id": course[0],
                "course_name": course[1],
                "course_image": course[2],
                "coach_id": course[3],
                "course_description": course[4],
                "restrictions": course[5],
                "deadline": course[6],
                "pool_id": course[7],
                "lane_id": course[8],
                "price": course[9],
                "capacity": course[10]
                } 
            course_data.append(course)
        
        return JsonResponse({"coach_courses": course_data})
    
@method_decorator(csrf_exempt, name='dispatch')
class CoachCoursesUpcomingView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        coach_id = request.GET.get('coachId')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM course WHERE coach_id=%s AND date >= CURRENT_DATE", [coach_id])
            courses = cursor.fetchall()

        course_data = []
        for course in courses:
            course= {
                "course_id": course[0],
                "course_name": course[1],
                "coach_id": course[2],
                "course_description": course[3],
                "date": course[4],
                "start_time": course[5],
                "end_time": course[6],
                "restrictions": course[7],
                "pool_id": course[8],
                "lane_id": course[9],
                "price": course[10],
                "capacity": course[11]
                } 
            course_data.append(course)

        return JsonResponse({"coach_courses": course_data})
    
@method_decorator(csrf_exempt, name='dispatch')
class CoachCoursesPreviousView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        coach_id = request.GET.get('coachId')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM course WHERE coach_id=%s AND date < CURRENT_DATE", [coach_id])
            courses = cursor.fetchall()

        course_data = []
        for course in courses:
            course= {
                "course_id": course[0],
                "course_name": course[1],
                "coach_id": course[2],
                "course_description": course[3],
                "date": course[4],
                "start_time": course[5],
                "end_time": course[6],
                "restrictions": course[7],
                "pool_id": course[8],
                "lane_id": course[9],
                "price": course[10],
                "capacity": course[11]
                } 
            course_data.append(course)
        return JsonResponse({"coach_courses": course_data})

@method_decorator(csrf_exempt, name='dispatch')
class LifeguardScheduleView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        lifeguard_id = request.GET.get('lifeguard_id')
        if not lifeguard_id:
            return JsonResponse({"error": "Lifeguard ID is required"}, status=400)

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM course_schedule WHERE lifeguard_id=%s", 
                    [lifeguard_id]
                )
                schedule = cursor.fetchall()

            if not schedule:
                return JsonResponse({"schedule": [], "message": "No schedule found for the lifeguard"}, status=200)

            schedule_data = [
                {
                    "course_schedule_id": shift[0],
                    "course_id": shift[1],
                    "swimmer_id": shift[2],
                    "lifeguard_id": shift[3],
                    "start_date": shift[4],
                    "end_date": shift[5],
                    "start_time": shift[6],
                    "end_time": shift[7],
                    "day": shift[8],
                    "status": shift[9],
                }
                for shift in schedule
            ]
            return JsonResponse({"schedule": schedule_data}, status=200)
        except Exception as e:
            return JsonResponse({"error": "An error occurred", "details": str(e)}, status=500)

#todo
@method_decorator(csrf_exempt, name='dispatch')
class LifeguardUpcomingHoursView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        lifeguard_id = request.GET.get('lifeguard_id')
        if not lifeguard_id:
            return JsonResponse({"error": "Lifeguard ID is required"}, status=400)

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT * FROM course_schedule 
                    WHERE lifeguard_id=%s 
                    AND (start_date > CURRENT_DATE OR (start_date = CURRENT_DATE AND start_time >= CURRENT_TIME))
                    """,
                    [lifeguard_id]
                )
                shifts = cursor.fetchall()

            if not shifts:
                return JsonResponse({"upcoming_hours": [], "message": "No upcoming hours for the lifeguard"}, status=200)

            shift_data = [
                {
                    "course_schedule_id": shift[0],
                    "course_id": shift[1],
                    "swimmer_id": shift[2],
                    "lifeguard_id": shift[3],
                    "start_date": shift[4],
                    "end_date": shift[5],
                    "start_time": shift[6],
                    "end_time": shift[7],
                    "day": shift[8],
                    "status": shift[9],
                }
                for shift in shifts
            ]
            return JsonResponse({"upcoming_hours": shift_data}, status=200)
        except Exception as e:
            return JsonResponse({"error": "An error occurred", "details": str(e)}, status=500)

#todo
@method_decorator(csrf_exempt, name='dispatch')
class BookSlotLifeguardView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        try:
            data = json.loads(request.body)
            course_id = data.get('course_id')
            lifeguard_id = data.get('lifeguard_id')
            start_date = data.get('start_date')
            end_date = data.get('end_date')
            start_time = data.get('start_time')
            end_time = data.get('end_time')
            day = data.get('day')

            if not all([course_id, lifeguard_id, start_date, end_date, start_time, end_time, day]):
                return JsonResponse({"error": "All fields are required"}, status=400)

            if start_date > end_date or (start_date == end_date and start_time >= end_time):
                return JsonResponse({"error": "Invalid date or time range"}, status=400)

            # Check for overlapping shifts
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT * FROM course_schedule 
                    WHERE lifeguard_id=%s 
                    AND ((start_date = %s AND start_time < %s AND end_time > %s) OR (start_date <= %s AND end_date >= %s))
                    """,
                    [lifeguard_id, start_date, end_time, start_time, end_date, start_date]
                )
                overlap = cursor.fetchone()
                if overlap:
                    return JsonResponse({"error": "Schedule overlaps with an existing shift"}, status=400)

            # Insert the new schedule
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO course_schedule (course_id, lifeguard_id, start_date, end_date, start_time, end_time, day, status) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    [course_id, lifeguard_id, start_date, end_date, start_time, end_time, day, "not-enrolled"]
                )
            return JsonResponse({"message": "Slot booked successfully"}, status=201)
        except Exception as e:
            return JsonResponse({"error": "An error occurred", "details": str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class UpcomingPoolBookingsView(View):
    permission_classes = [AllowAny]

    def get(self, request):
        swimmer_id = request.GET.get('swimmer_id')

        if not swimmer_id:
            return JsonResponse({"error": "Swimmer ID is required."}, status=400)

        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM private_booking 
                    WHERE swimmer_id = %s 
                    AND (booking_date > CURRENT_DATE OR (booking_date = CURRENT_DATE AND start_time >= CURRENT_TIME))
                """, [swimmer_id])
                bookings = cursor.fetchall()

            if not bookings:
                return JsonResponse({"upcoming_bookings": [], "message": "No upcoming bookings found for the swimmer."}, status=200)

            booking_data = [
                {
                    "private_booking_id": booking[0],
                    "swimmer_id": booking[1],
                    "lane_id": booking[2],
                    "start_time": booking[3],
                    "end_time": booking[4],
                    "status": booking[5],
                    "booking_date": booking[6]
                } for booking in bookings
            ]
            return JsonResponse({"upcoming_bookings": booking_data}, status=200)
        except Exception as e:
            return JsonResponse({"error": "An error occurred while fetching upcoming bookings.", "details": str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class GetTotalMoneyView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        swimmer_id = request.GET.get('swimmer_id')
        with connection.cursor() as cursor:
            cursor.execute("SELECT total_money FROM swimmer WHERE swimmer_id=%s", [swimmer_id])
            balance = cursor.fetchone()
    
        return JsonResponse({"total_money": balance[0]})
    
@method_decorator(csrf_exempt, name='dispatch')
class GetBalanceView(View):
    permission_classes = [AllowAny]
    
    def get(self, request):
        worker_id = request.GET.get('worker_id')
        
        if not worker_id:
            return JsonResponse({"error": "Worker ID is required."}, status=400)
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT balance FROM worker WHERE worker_id=%s", [worker_id])
            balance = cursor.fetchone()
        
        if balance:
            return JsonResponse({"balance": balance[0]}, status=200)
        else:
            return JsonResponse({"error": "Worker not found or no balance available."}, status=404)


@method_decorator(csrf_exempt, name='dispatch')
class WithdrawMoneyView(View):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data = json.loads(request.body)
            print(data) 
            worker_id = data.get('userId')
            amount = float(data.get('amount'))


            with connection.cursor() as cursor:
                cursor.execute("SELECT balance FROM worker WHERE worker_id=%s", [worker_id])
                result = cursor.fetchone()

                if not result:
                    return JsonResponse({"error": "Worker not found."}, status=404)

                balance = result[0]
                if balance < amount:
                    return JsonResponse({"error": "Insufficient funds."}, status=400)

                # Deduct amount from balance
                cursor.execute(
                    "UPDATE worker SET balance = balance - %s WHERE worker_id = %s",
                    [amount, worker_id]
                )

            return JsonResponse({"message": "Withdrawal successful."}, status=200)

        except Exception as e:
            return JsonResponse({"error": "An error occurred.", "details": str(e)}, status=500)

    
@method_decorator(csrf_exempt, name='dispatch')
class WithdrawMoneyWorkerView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        worker_id = data.get('worker_id')
        amount = float(data.get('amount'))

        with connection.cursor() as cursor:
            cursor.execute("SELECT balance FROM worker WHERE worker_id=%s", [worker_id])
            total_money = cursor.fetchone()
            
            if not total_money or total_money[0] < amount:
                return JsonResponse({"error": "Insufficient funds or user not found"}, status=400)

            cursor.execute("UPDATE worker SET balance = balance - %s WHERE worker_id = %s", [amount, worker_id])
        
        return JsonResponse({"message": "Withdrawal successful"})

@method_decorator(csrf_exempt, name='dispatch')
class DepositMoneyView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        swimmer_id = data.get('swimmer_id')
        amount = float(data.get('amount'))

        with connection.cursor() as cursor:
            cursor.execute("UPDATE swimmer SET total_money = total_money + %s WHERE swimmer_id = %s", [amount, swimmer_id])
        
        return JsonResponse({"message": "Deposit successful"}, status=200)
    
@method_decorator(csrf_exempt, name='dispatch')
class DepositMoneyWorkerView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        worker_id = data.get('worker_id')
        amount = float(data.get('amount'))

        with connection.cursor() as cursor:
            cursor.execute("UPDATE worker SET balance = balance + %s WHERE worker_id = %s", [amount, worker_id])
        
        return JsonResponse({"message": "Deposit successful"}, status=200)

@method_decorator(csrf_exempt, name='dispatch')
class AddCafeItemToCartView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        purchaser_id = data.get("purchaser_id")
        cafe_item_id = data.get("cafe_item_id")
        cafe_id = data.get("cafe_id")
        
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO cart (purchaser_id, course_id, cafe_item_id, cafe_id, lane_id) VALUES (%s, %s, %s, %s, %s)",
                [purchaser_id, 0, cafe_item_id, cafe_id, 0],
            )

        return JsonResponse({"message": "Item added to cart successfully"})

@method_decorator(csrf_exempt, name='dispatch')
class RemoveCafeItemFromCartView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        purchaser_id = data.get("purchaser_id")
        item_id = data.get("cafe_item_id")
        all_or_one = data.get("all_or_one")
        
        if(all_or_one == "all"):
            with connection.cursor() as cursor:
                cursor.execute(
                    "DELETE FROM cart WHERE purchaser_id = %s AND cafe_item_id = %s ORDER BY cart_id ASC LIMIT 1",
                    [purchaser_id, item_id],
                )
        else:
            with connection.cursor() as cursor:
                cursor.execute(
                    "DELETE FROM cart WHERE purchaser_id = %s AND cafe_item_id = %s",
                    [purchaser_id, item_id],
                )

        return JsonResponse({"message": "Item removed from cart successfully"})
       
@method_decorator(csrf_exempt, name='dispatch')
class BuyCafeItemView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        purchaser_id = data.get("purchaser_id")
        item_id = data.get("cafe_item_id")
        is_swimmer = data.get("is_swimmer")
        
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT SUM(price), cafe_id cafe_item WHERE cafe_item_id IN (SELECT * FROM cart WHERE purchaser_id=%s AND cafe_item_id=%s)",
                [purchaser_id, item_id],
            )
            item = cursor.fetchone()
            price = item[0]
            cafe_id = item[1]
            
        if(is_swimmer):
            with connection.cursor() as cursor:
                cursor.execute("SELECT total_money FROM swimmer WHERE swimmer_id=%s", [purchaser_id])
                total_money = cursor.fetchone()
                
                if not total_money or total_money[0] < price:
                    return JsonResponse({"error": "Insufficient money"}, status=400)
                
                cursor.execute(
                    "DELETE FROM cart WHERE purchaser_id = %s AND cafe_item_id = %s",
                    [purchaser_id, item_id],
                )
                
                cursor.execute("UPDATE swimmer SET total_money = total_money - %s WHERE swimmer_id = %s", [price, purchaser_id])
        
        else:
        
            with connection.cursor() as cursor:
                cursor.execute("SELECT balance FROM worker WHERE worker_id=%s", [purchaser_id])
                balance = cursor.fetchone()
                
                if not balance or balance[0] < price:
                    return JsonResponse({"error": "Insufficient money"}, status=400)
                
                cursor.execute(
                    "DELETE FROM cart WHERE purchaser_id = %s AND cafe_item_id = %s",
                    [purchaser_id, item_id],
                )
                
                cursor.execute("UPDATE worker SET balance = balance - %s WHERE worker_id = %s", [price, purchaser_id])
           
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO buying_history(purchaser_id, course_id, cafe_item_id, cafe_id, lane_id, purchased_at) VALUES(%s, %s, %s, %s, %s, %s, %s)",
                    [purchaser_id, 0, item_id, cafe_id, 0, datetime.now],
                )
                
        return JsonResponse({"message": "Item removed from cart successfully"})
@method_decorator(csrf_exempt, name='dispatch')
class AddCourseToCartView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        purchaser_id = data.get("purchaser_id")
        course_id = data.get("course_id")

        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO cart (purchaser_id, course_id) VALUES (%s, %s)",
                [purchaser_id, course_id],
            )

        return JsonResponse({"message": "Course added to cart successfully"})
    
@method_decorator(csrf_exempt, name='dispatch')
class RemoveCourseFromCartView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        purchaser_id = data.get("purchaser_id")
        course_id = data.get("item_id")

        with connection.cursor() as cursor:
            cursor.execute(
                "DELETE FROM cart WHERE purchaser_id = %s AND course_id = %s",
                [purchaser_id, course_id],
            )

        return JsonResponse({"message": "Course removed from cart successfully"})
    
@method_decorator(csrf_exempt, name='dispatch')
class FinishCourseView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        course_id = data.get("course_id")
        coach_id  = data.get("coach_id")
        
        with connection.cursor() as cursor:
            cursor.execute("UPDATE course SET date = %s WHERE course_id = %s ",['2000-01-01', course_id, ])
            
            cursor.execute("SELECT * FROM course WHERE course_id =%s", [course_id])
            course = cursor.fetchone()
            course_price = course[10]
            
            cursor.execute("SELECT COUNT(*) FROM buying_history WHERE course_id=%s", [course_id])
            participant_count = cursor.fetchone()[0]
            course_price = (course_price * participant_count * 60)/100.0
            
            cursor.execute("UPDATE worker SET balance = balance+ %s WHERE worker_id=%s",[course_price, coach_id])

        return JsonResponse({"message": "Course marked as finished successfully"})
    
@method_decorator(csrf_exempt, name='dispatch')
class CancelCourseView(View):
    permission_classes = [AllowAny]
    
    def post(self, request):
        data = json.loads(request.body)
        course_id = data.get("course_id")
        coach_id = data.get("coach_id")
        
        if not course_id or not coach_id:
            return JsonResponse({"error": "Both course_id and coach_id are required"}, status=400)
        
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM course WHERE course_id = %s",[course_id])
            
        return JsonResponse({"message": "Course deleted successfully"})
    

@method_decorator(csrf_exempt, name='dispatch')
class WithdrawPersonalTrainingView(View):
    permission_classes = [AllowAny]
    def post(self, request):   
        data = json.loads(request.body)
        swimmer_id = data.get("swimmer_id")
        training_id = data.get("training_id")

        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE course_schedule SET status= 'withdrawn' WHERE swimmer_id = %s AND training_id = %s",
                [swimmer_id, training_id],
            )

        return JsonResponse({"message": "Successfully withdrawn from the personal training session"})
    
@method_decorator(csrf_exempt, name='dispatch')
class FinishPersonalTrainingView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        training_id = data.get("training_id")
        coach_id = data.get("coach_id")

        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE course_schedule SET status = 'finished' WHERE course_id = %s AND coach_id=%s",
                [training_id, coach_id],
            )

        return JsonResponse({"message": "Personal training session marked as finished successfully"})

@method_decorator(csrf_exempt, name='dispatch')
class PasswordChangeEmailView(View):
    permission_classes = [AllowAny]
    def post(self, request):
        data = json.loads(request.body)
        recipient_email = data.get("email")
        
        subject = 'Password Change'
        message = 'This is a password change email'
        from_email = 'your_email@example.com'
        recipient_list = [recipient_email]

        send_mail(subject, message, from_email, recipient_list)
        return JsonResponse({"message": "Mail sended successfully"})
    
@method_decorator(csrf_exempt, name='dispatch')
class GetAllBuyingHistoryView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM buying_history GROUP BY purchaser_id")
            items = cursor.fetchall()
        
        buying_history_data = []
        for item in items:
            buying_history={
                "history_id": item[0],
                "purchaser_id": item[1],
                "course_id": item[2],
                "cafe_item_id": item[3],
                "lane_id": item[4],
                "quantity": item[5],
                "purchased_at": item[6]
            } 
            buying_history_data.append(buying_history)
        return JsonResponse({"buying_history": buying_history_data})
        
@method_decorator(csrf_exempt, name='dispatch')
class GetUserBuyingHistoryView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        user_id = request.GET.get('user_id')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM buying_history WHERE user_id=%s", [user_id])
            items = cursor.fetchall()
        
        buying_history_data = []
        for item in items:
            buying_history={
                "history_id": item[0],
                "purchaser_id": item[1],
                "course_id": item[2],
                "cafe_item_id": item[3],
                "lane_id": item[4],
                "quantity": item[5],
                "purchased_at": item[6]
            } 
            buying_history_data.append(buying_history)
        return JsonResponse({"buying_history": buying_history_data})


@method_decorator(csrf_exempt, name='dispatch')
class GetCourseStudentsView(View):
    permission_classes = [AllowAny]
    def get(self, request):
        course_id = request.GET.get('course_id')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM all_users WHERE user_id IN (SELECT swimmer_id FROM course_schedule WHERE course_id=%s)", [course_id])
            students = cursor.fetchall()
        
        course_students = []
        for user in students:
            student={
                "user_id": user[0],
                "user_image": user[1],
                "name": user[2],
                "surname": user[3],
                "username": user[4],
                "password": user[5],
                "user_type": user[6],
                "email": user[7],
            } 
            course_students.append(student)
            
        return JsonResponse({"students": course_students})

@method_decorator(csrf_exempt, name='dispatch')
class GetAllCoursesView(View):
    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM course GROUP BY course_id")

                courses = cursor.fetchall()

            if not courses:
                return JsonResponse({"courses": []}, status=200)

            course_data = [
                {
                    "course_id": course[0],
                    "course_name": course[1],
                    "coach_id": course[2],
                    "course_description": course[3],
                    "date": course[4],
                    "start_time": course[5],
                    "end_time": course[6],
                    "restrictions": course[7],
                    "pool_id": course[8],
                    "lane_id": course[9],
                    "price": course[10],
                    "capacity": course[11],
                    }
                for course in courses
            ]

            return JsonResponse({"courses": course_data}, status=200)

        except Exception as e:
            print(f"Error in AllCoursesView: {e}")
            return JsonResponse({"error": "An error occurred while fetching courses.", "details": str(e)}, status=500)
