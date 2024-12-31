import datetime
import json
from django.http import JsonResponse
from django.views import View
from django.db import connection
from django.core.mail import send_mail
 
class LoginView(View):
    class LoginView(View):
        def post(self, request):
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM all_users WHERE username=%s AND password=%s", [username, password])
                user = cursor.fetchone()

            if user:
                user_id = user[0]
                request.session['user_id'] = user_id

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
class RegisterView(View):
    def post(self, request):
        data = json.loads(request.body)
        username = data.get('username')
        name = data.get('name')
        surname =  data.get('surname')
        password = data.get('password')
        user_type = data.get('user-type')

        with connection.cursor() as cursor:
            cursor.execute("SELECT user_id FROM all_users WHERE username=%s", [username])
            existing = cursor.fetchone()

        if existing:
            return JsonResponse({"error":"User already exists"}, status=400)

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO all_users (forename, surname, username, password, account_money, user_type)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING user_id
            """, [name, surname, username, password, 0, user_type])
            new_user_id = cursor.fetchone()[0]

        if new_user_id and user_type == "1":  # Swimmer
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO swimmer (swimmer_id, phone_number, age, gender, swimming_proficiency, number_of_booked_slots, total_courses_enrolled, total_courses_terminated, membership_status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s,%s)
                """, [new_user_id, "", 0, "", "", 0, 0, 0,  "nonmember"]) 
                
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

class ChangePasswordView(View):
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

class AllCoursesView(View):
    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM course")
            courses = cursor.fetchall()
        
        all_course_data = []
        for course in courses:
            all_course_data = {
                "course_id": course[0],
                "course_name": course[1],
                "course_image": course[2],
                "coach_id": course[3],
                "course_description": course[4],
                "restrictions": course[5],
                "deadline": course[5],
                "pool_id": course[6],
                "lane_id": course[7],
                "price": course[8]
            }
            
        all_course_data.append(all_course_data)
        return JsonResponse({"courses": all_course_data})

class CurrentCoursesView(View):
    def get(self, request):
        swimmer_id = request.GET.get('user_id')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM course where course_id IN (SELECT course_id FROM course_schedule WHERE swimmer_id=%s AND status=%s)", [swimmer_id, "in-progress"])
            courses = cursor.fetchall()
        
        current_course_data = []
        for course in courses:
            current_course_data = {
                "course_id": course[0],
                "course_name": course[1],
                "course_image": course[2],
                "coach_id": course[3],
                "course_description": course[4],
                "restrictions": course[5],
                "deadline": course[5],
                "pool_id": course[6],
                "lane_id": course[7],
                "price": course[8]
            }
            
        current_course_data.append(current_course_data)
        return JsonResponse({"current-courses": current_course_data})
    
class PreviousCoursesView(View):
    def get(self, request):
        swimmer_id = request.GET.get('user_id')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM course where course_id IN (SELECT course_id FROM course_schedule WHERE swimmer_id=%s AND (status=%s OR status=%s ) )", [swimmer_id, "withdrawn", "finished"])
            courses = cursor.fetchall()
        
        current_course_data = []
        for course in courses:
            current_course_data = {
                "course_id": course[0],
                "course_name": course[1],
                "course_image": course[2],
                "coach_id": course[3],
                "course_description": course[4],
                "restrictions": course[5],
                "deadline": course[5],
                "pool_id": course[6],
                "lane_id": course[7],
                "price": course[8]
            }
            
        current_course_data.append(current_course_data)
        return JsonResponse({"previous-courses": current_course_data})
    
class GetCourseView(View):
    def get(self, request):
        course_id = request.GET.get('course_id')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM course where course_id=%s", [course_id])
            course = cursor.fetchone()
        
        current_course_data = []
        if course:
            current_course_data = {
               "course_id": course[0],
                "course_name": course[1],
                "course_image": course[2],
                "coach_id": course[3],
                "course_description": course[4],
                "restrictions": course[5],
                "deadline": course[5],
                "pool_id": course[6],
                "lane_id": course[7],
                "price": course[8]
            }
            
        current_course_data.append(current_course_data)
        return JsonResponse({"course": current_course_data})
    
class CreateCourseView(View):
    def post(self, request):
        data = json.loads(request.body)
        name = data.get("course_name")
        coach_id = data.get("coach_id")
        description = data.get("course_description")
        restrictions = data.get("restrictions")
        deadline = data.get("deadline")
        pool_id = data.get("pool_id")
        lane_id = data.get("lane_id")
        price = data.get("price")
        course_type = data.get("type")
        capacity = data.get("capacity")
        skill_level = data.get("skill_level")
        
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO course (course_name, coach_id, course_description, restrictions, deadline, pool_id, lane_id, price)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, [name, coach_id, description, restrictions, deadline, pool_id, lane_id, price])
            
            new_course_id = cursor.fetchone()[0]
            
            if(course_type == "swimming_lesson"):
                cursor.execute("INSERT INTO swimming_lesson (lesson_id, capacity, is_full, skill_level)VALUES (%s, %s, %s, %s)", 
                               [new_course_id, capacity, False, skill_level])
            else:
                cursor.execute("INSERT INTO personal_training (training_id) VALUES (%s)",[new_course_id])
        
        return JsonResponse({"message": "Course created successfully"}, status=201)

class DeleteCourseView(View):
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
    
class UpdateCourseView(View):
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

class EnrollCourseView(View):
    def post(self, request):
        data = json.loads(request.body)
        swimmer_id = data.get("swimmer_id")
        course_id = data.get("course_id")
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM course_schedule where course_id=%s", [course_id])
            course = cursor.fetchone()
            
            coach_id = course[3]
            start_day = course[4]
            end_day = course[5]
            start_time = course[6]
            end_time = course[7]
            day = course[8]
            
            cursor.execute("SELECT * FROM course where course_id=%s", [course_id])
            course = cursor.fetchone()
            
            price = course[9]
        
            cursor.execute("SELECT account_money FROM all_users WHERE user_id=%s", [swimmer_id])
            account_money = cursor.fetchone()
            
            if not account_money or account_money[0] < price:
                return JsonResponse({"error": "Insufficient money"}, status=400)

        with connection.cursor() as cursor:
            cursor.execute(
                "DELETE FROM cart WHERE purchaser_id = %s AND course_id = %s",
                [swimmer_id, course_id],
            )  
        
            cursor.execute("UPDATE all_users SET account_money = account_money - %s WHERE user_id = %s", [price, swimmer_id])
            
            
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO course_schedule (course_id, swimmer_id, coach_id, start_date, end_date, start_time, end_time, day, status) VALUES (%s, %s)",
                [course_id, swimmer_id, coach_id, start_day, end_day, start_time, end_time, day, "in-progress"]
            )
            
            cursor.execute(
                "INSERT INTO buying_history(purchaser_id, course_id, cafe_item_id, cafe_id, lane_id, purchased_at) VALUES(%s, %s, %s, %s, %s, %s, %s)",
                [swimmer_id, course_id, 0, 0, 0, datetime.now],
            )  
        
        return JsonResponse({"message": "Successfully enrolled in the course"}, status=201)
    
class CoachRatingView(View):
    def get(self, request):
        coach_id = request.GET.get("coach_id")
               
        with connection.cursor() as cursor:
            cursor.execute("SELECT AVG(rating) FROM rating WHERE coach_id=%s", [coach_id])
            avg_rating = cursor.fetchone()
        
        return JsonResponse({"coach_id": coach_id, "avg_rating": avg_rating or 0.0}, status=200)
    
class AddRatingView(View):
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
    
class UpdateRatingView(View):
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
    
class CourseCommentsView(View):
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
        
class AddCourseCommentView(View):
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

class PoolsView(View):
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

class AllLanesView(View):
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
        
class AvailableLanes(View):
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

class BookLaneView(View):
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
            
            cursor.execute("UPDATE all_users SET account_money = account_money - %s WHERE user_id = %s", [booking_price, swimmer_id])
            
            cursor.execute(
                "INSERT INTO buying_history(purchaser_id, course_id, cafe_item_id, cafe_id, lane_id, purchased_at) VALUES(%s, %s, %s, %s, %s, %s, %s)",
                [swimmer_id, 0, 0, 0, lane_id, datetime.now],
            )
            
        return JsonResponse({"message": "Lane booked successfully"})
    
class UsersView(View):
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
                    "account_money": user[6],
                    "user_type": user[7]
                    }
            all_users.append(user_data)
        return JsonResponse({"users": all_users})

class AllSwimmersView(View):
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
    
class GetUserView(View):
    def get(self, request):
        user_id = request.GET.get('user_id')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM user WHERE id = %s", [user_id])
            user = cursor.fetchone()

        if user:
            user_data = {
                "user_id": user[0],
                "user_image": user[1],
                "forename": user[2],
                "surname": user[3],
                "username": user[4],
                "password": user[5],
                "account_money": user[6]
            }
        
        return JsonResponse({"user": user_data})

class CreateUserView(View):
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
                INSERT INTO all_users (forename, surname, username, password, account_money, user_type)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING user_id
            """, [name, surname, username, password, 0, user_type])
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

class DeleteUserView(View):
    def delete(self, request):
        user_id = request.GET.get('user_id')
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM all_users WHERE id = %s", [user_id])
            user_type = cursor.fetchone()[7]
            
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM all_users WHERE id = %s", [user_id])
            
        if(user_type == "1"):
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM swimmer WHERE id = %s", [user_id])
                
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM nonmember_swimmer WHERE id = %s", [user_id])
            
        elif(user_type == "2"):
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM swimmer WHERE id = %s", [user_id])
            
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM member_swimmer WHERE id = %s", [user_id])
            
        elif(user_type == "3"):
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM worker WHERE id = %s", [user_id])
                
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM lifeguard WHERE id = %s", [user_id])
             
        elif(user_type == "4"):
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM worker WHERE id = %s", [user_id])
            
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM coach WHERE id = %s", [user_id])
                
        else: #(user_type == "5")
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM administrator WHERE id = %s", [user_id])
    
        return JsonResponse({"message": "User deleted successfully"})

class UpdateMemberProfileView(View):
    def post(self, request):
        data = json.loads(request.body)
        user_id = data.get("user_id")
        user_image = data.get("user_image")
        forename = data.get('forename')
        surname = data.get('surname')
        username = data.get('username')
        password = data.get('password')
        account_money = data.get("account_money")
        swim_proficiency = data.get("swim_proficiency")
        number_of_booked_slots = data.get("number_of_booked_slots")
        total_courses_enrolled = data.get("total_courses_enrolled")
        total_courses_terminated = data.get("total_courses_terminated")
        membership_status = data.get("membership_status")
        points = data.get("points")
        monthly_payment_amount = data.get("monthly_payment")
        number_of_personal_training_hours = data.get("number_of_personal_training_hours")
        ranking = data.get("ranking")
        number_of_items_purchased = data.get("number_of_items_purchases")
        age = data.get("age")
        gender = data.get("gender")
        phone_number = data.get("phone_number")
        
        with connection.cursor() as cursor:
                cursor.execute("UPDATE all_users SET user_image=%s, forename=%s, surname=%s, username=%s, password=%s, account_money=%s WHERE user_id=%s",
                               [user_image, forename, surname, username, password, account_money, user_id])
                
        with connection.cursor() as cursor:
            cursor.execute("UPDATE swimmer SET phone_number=%s, age=%s, gender=%s, swimming_proficiency=%s, number_of_booked_slots=%s, total_courses_enrolled=%s, total_courses_terminated=%s, membership_status=%s WHERE swimmer_id=%s",
                            [phone_number, age, gender, swim_proficiency, number_of_booked_slots, total_courses_enrolled, total_courses_terminated, membership_status, user_id])
            
        with connection.cursor() as cursor:
            cursor.execute("UPDATE member_swimmer SET points=%s, monthly_payment_amount=%s, number_of_personal_training_hours=%s, ranking=%s, number_of_items_purchased=%s WHERE swimmer_id=%s",
                            [points, monthly_payment_amount, number_of_personal_training_hours, ranking, number_of_items_purchased])
        
        return JsonResponse({"message": "Member updated successfully"})
     
class UpdateNonmemberProfileView(View):
    def post(self, request):
        data = json.loads(request.body)
        user_id = data.get("user_id")
        user_image = data.get("user_image")
        forename = data.get('forename')
        surname = data.get('surname')
        username = data.get('username')
        password = data.get('password')
        account_money = data.get("account_money")
        swim_proficiency = data.get("swim_proficiency")
        number_of_booked_slots = data.get("number_of_booked_slots")
        total_courses_enrolled = data.get("total_courses_enrolled")
        total_courses_terminated = data.get("total_courses_terminated")
        membership_status = data.get("membership_status")
        age = data.get("age")
        gender = data.get("gender")
        phone_number = data.get("phone_number")
        
        with connection.cursor() as cursor:
            cursor.execute("UPDATE all_users SET user_image=%s, forename=%s, surname=%s, username=%s, password=%s, account_money=%s WHERE user_id=%s",
                            [user_image, forename, surname, username, password, account_money, user_id])
                
        with connection.cursor() as cursor:
            cursor.execute("UPDATE swimmer SET phone_number=%s, age=%s, gender=%s, swimming_proficiency=%s, number_of_booked_slots=%s, total_courses_enrolled=%s, total_courses_terminated=%s, membership_status=%s WHERE swimmer_id=%s",
                            [phone_number, age, gender, swim_proficiency, number_of_booked_slots, total_courses_enrolled, total_courses_terminated, membership_status, user_id])
        
        return JsonResponse({"message": "Nonmember updated successfully"})
    
class UpdateCoachProfileView(View):
    def post(self, request):
        data = json.loads(request.body)
        user_id = data.get("user_id")
        user_image = data.get("user_image")
        forename = data.get('forename')
        surname = data.get('surname')
        username = data.get('username')
        password = data.get('password')
        account_money = data.get("account_money")
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
            cursor.execute("UPDATE all_users SET user_image=%s, forename=%s, surname=%s, username=%s, password=%s, account_money=%s WHERE user_id=%s",
                            [user_image, forename, surname, username, password, account_money, user_id])
                
        with connection.cursor() as cursor:
            cursor.execute("UPDATE worker SET pool_id=%s, salary=%s, age=%s, gender=%s, phone_number=%s, swimming_proficiency=%s, qualifications=%s WHERE worker_id=%s",
                            [pool_id, salary, age, gender, phone_number, swim_proficiency, qualifications, user_id])
            
        with connection.cursor() as cursor:
            cursor.execute("UPDATE coach SET avg_rating=%s, coach_ranking=%s, specialties=%s WHERE coach_id=%s",
                            [avg_rating, coach_ranking, specialties])
        
        return JsonResponse({"message": "Coach updated successfully"})
    
class UpdateLifeguardProfileView(View):
    def post(self, request):
        data = json.loads(request.body)
        user_id = data.get("user_id")
        user_image = data.get("user_image")
        forename = data.get('forename')
        surname = data.get('surname')
        username = data.get('username')
        password = data.get('password')
        account_money = data.get("account_money")
        pool_id = data.get("pool_id")
        salary = data.get("salary")
        age = data.get("age")
        gender = data.get("gender")
        phone_number = data.get("phone_number")
        swim_proficiency = data.get("swim_proficiency")
        qualifications = data.get("qualifications")
        certifications = data.get("certifications")
        
        with connection.cursor() as cursor:
            cursor.execute("UPDATE all_users SET user_image=%s, forename=%s, surname=%s, username=%s, password=%s, account_money=%s WHERE user_id=%s",
                            [user_image, forename, surname, username, password, account_money, user_id])
                
        with connection.cursor() as cursor:
            cursor.execute("UPDATE worker SET pool_id=%s, salary=%s, age=%s, gender=%s, phone_number=%s, swimming_proficiency=%s, qualifications=%s WHERE worker_id=%s",
                            [pool_id, salary, age, gender, phone_number, swim_proficiency, qualifications, user_id])
            
        with connection.cursor() as cursor:
            cursor.execute("UPDATE lifeguard SET certifications=%s WHERE lifeguard_id=%s",
                            [certifications])
        
        return JsonResponse({"message": "Lifeguard updated successfully"})
        
class UpdateAdministratorProfileView(View):
    def post(self, request):
        data = json.loads(request.body)
        user_id = data.get("user_id")
        user_image = data.get("user_image")
        forename = data.get('forename')
        surname = data.get('surname')
        username = data.get('username')
        password = data.get('password')
        account_money = data.get("account_money")
        number_of_reports = data.get("number_of_reports")
        
        with connection.cursor() as cursor:
            cursor.execute("UPDATE all_users SET user_image=%s, forename=%s, surname=%s, username=%s, password=%s, account_money=%s WHERE user_id=%s",
                        [user_image, forename, surname, username, password, account_money, user_id])
                
        with connection.cursor() as cursor:
            cursor.execute("UPDATE administrator SET number_of_reports=%s WHERE administrator_id=%s",
                        [number_of_reports, user_id])
        
        return JsonResponse({"message": "Admin updated successfully"})
    
class GetUserView(View):
    def get(self, request):
        user_id = request.GET.get('user_id')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM user WHERE id = %s", [user_id])
            user = cursor.fetchone()

        if user:
            user_data = {
                "user_id": user[0],
                "username": user[1],
                "email": user[2],
                "role": user[3],
            }
            return JsonResponse({"profile": user_data})
        else:
            return JsonResponse({"error": "User not found"}, status=404)
        
class GetMemberSwimmerView(View):
    def get(self, request):
        member_id = request.GET.get('member_id')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM member_swimmer WHERE swimmer_id = %s", [member_id])
            user = cursor.fetchone()

        if user:
            user_data = {
                "swimmer_id": user[0],
                "points": user[1],
                "monthly_payment_amount": user[2],
                "number_of_personal_training_hours": user[3],
                "ranking": user[4],
                "number_of_items_purchased": user[5],
            }
            return JsonResponse({"member": user_data})
        else:
            return JsonResponse({"error": "Member not found"}, status=404)
    
class GetNonmemberSwimmerView(View):
    def get(self, request):
        non_member_id = request.GET.get('non_member_id')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM nonmember_swimmer WHERE swimmer_id = %s", [non_member_id])
            user = cursor.fetchone()

        if user:
            user_data = {
                "swimmer_id": user[0],
                "registration_timestamp": user[1],
            }
            return JsonResponse({"nonmember": user_data})
        else:
            return JsonResponse({"error": "Nonmember not found"}, status=404)
    
class GetCoachView(View):
    def get(self, request):
        coach_id = request.GET.get('coach_id')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM coach WHERE coach_id = %s", [coach_id])
            user = cursor.fetchone()

        if user:
            user_data = {
                "coach_id": user[0],
                "avg_rating": user[1],
                "coach_ranking": user[2],
                "specialties": user[3],
            }
            return JsonResponse({"coach": user_data})
        else:
            return JsonResponse({"error": "Coach not found"}, status=404)
        
    
class GetLifeguardView(View):
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
    
class GetAdministratorView(View):
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

class BecomeMemberView(View):
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

class CancelMembershipView(View):
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

class DailyCoursesCoachView(View):
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

class DailyCoursesMemberView(View):
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
    
class WeeklyCoursesCoachView(View):
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
    
class WeeklyCoursesMemberView(View):
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

class DailyCoursesNonmemberView(View):
    def get(self, request):
        swimmer_id = request.GET.get('nonmember_id')
        with connection.cursor() as cursor:
            cursor.execute(
                  cursor.execute("SELECT * FROM course_schedule JOIN course ON coach_id WHERE swimmer_id = %s AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE  AND EXTRACT(DOW FROM CURRENT_DATE) = day", [member_id])
                [swimmer_id],
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

class WeeklyCoursesNonmemberView(View):
   def get(self, request):
        nonmember_id = request.GET.get('nonmember_id')
        today = datetime.today()
        start_of_week = today - datetime.timedelta(days=today.weekday()) 
        end_of_week = start_of_week + datetime.timedelta(days=6) 

        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM course WHERE course_id IN (SELECT course_id FROM course_schedule WHERE swimmer_id = %s AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE AND day BETWEEN %s AND %s AND status='in-progress)", 
                           [nonmember_id, start_of_week.date(), end_of_week.date()])
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

class CafeItemsView(View):
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


class CafeItemView(View):
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

class CartItemsView(View):
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

class CoachCoursesView(View):
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
                "price": course[9]
                } 
        
        return JsonResponse({"coach_courses": course_data})

#todo
class LifeguardScheduleView(View):
    def get(self, request):
        lifeguard_id = request.GET.get('lifeguard_id')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM lifeguard_schedule WHERE lifeguard_id=%s", [lifeguard_id])
            schedule = cursor.fetchall()
        
        schedule_data = [
            {
                "shift_id": shift[0],
                "lifeguard_id": shift[1],
                "start_time": shift[2],
                "end_time": shift[3],
                "pool_id": shift[4]
            } for shift in schedule
        ]
        return JsonResponse({"schedule": schedule_data})

#todo
class LifeguardUpcomingHoursView(View):
    def get(self, request):
        lifeguard_id = request.GET.get('lifeguard_id')
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM lifeguard_schedule WHERE lifeguard_id=%s AND start_time >= CURRENT_TIMESTAMP",
                [lifeguard_id]
            )
            shifts = cursor.fetchall()
        
        shift_data = [
            {
                "shift_id": shift[0],
                "start_time": shift[2],
                "end_time": shift[3],
                "pool_id": shift[4]
            } for shift in shifts
        ]
        return JsonResponse({"upcoming_hours": shift_data})

#todo
class BookSlotLifeguardView(View):
    def post(self, request):
        data = json.loads(request.body)
        lifeguard_id = data.get('lifeguard_id')
        pool_id = data.get('pool_id')
        start_time = data.get('start_time')
        end_time = data.get('end_time')

        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO lifeguard_schedule (lifeguard_id, start_time, end_time, pool_id) VALUES (%s, %s, %s, %s)",
                [lifeguard_id, start_time, end_time, pool_id]
            )
        return JsonResponse({"message": "Slot booked successfully"})

#todo
class UpcomingPoolBookingsView(View):
    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM pool_bookings WHERE booking_time >= CURRENT_TIMESTAMP")
            bookings = cursor.fetchall()
        
        booking_data = [
            {
                "booking_id": booking[0],
                "user_id": booking[1],
                "pool_id": booking[2],
                "lane_id": booking[3],
                "booking_time": booking[4]
            } for booking in bookings
        ]
        return JsonResponse({"upcoming_bookings": booking_data})

class GetAccountMoneyView(View):
    def get(self, request):
        user_id = request.GET.get('user_id')
        with connection.cursor() as cursor:
            cursor.execute("SELECT account_money FROM all_users WHERE user_id=%s", [user_id])
            balance = cursor.fetchone()
    
        return JsonResponse({"account_money": balance[0]})

class WithdrawMoneyView(View):
    def post(self, request):
        data = json.loads(request.body)
        user_id = data.get('user_id')
        amount = float(data.get('amount'))

        with connection.cursor() as cursor:
            cursor.execute("SELECT account_money FROM all_users WHERE user_id=%s", [user_id])
            account_money = cursor.fetchone()
            
            if not account_money or account_money[0] < amount:
                return JsonResponse({"error": "Insufficient funds or user not found"}, status=400)

            cursor.execute("UPDATE all_users SET account_money = account_money - %s WHERE user_id = %s", [amount, user_id])
        
        return JsonResponse({"message": "Withdrawal successful"})

class DepositMoneyView(View):
    def post(self, request):
        data = json.loads(request.body)
        user_id = data.get('user_id')
        amount = float(data.get('amount'))

        with connection.cursor() as cursor:
            cursor.execute("UPDATE all_users SET account_money = account_money + %s WHERE user_id = %s", [amount, user_id])
        
        return JsonResponse({"message": "Deposit successful"}, status=200)

class AddCafeItemToCartView(View):
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

class RemoveCafeItemFromCartView(View):
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
       
class BuyCafeItemView(View):
    def post(self, request):
        data = json.loads(request.body)
        purchaser_id = data.get("purchaser_id")
        item_id = data.get("cafe_item_id")
        
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT SUM(price), cafe_id cafe_item WHERE cafe_item_id IN (SELECT * FROM cart WHERE purchaser_id=%s AND cafe_item_id=%s)",
                [purchaser_id, item_id],
            )
            item = cursor.fetchone()
            price = item[0]
            cafe_id = item[1]
            
            cursor.execute("SELECT account_money FROM all_users WHERE user_id=%s", [purchaser_id])
            account_money = cursor.fetchone()
            
            if not account_money or account_money[0] < price:
                return JsonResponse({"error": "Insufficient money"}, status=400)
            
            cursor.execute(
                "DELETE FROM cart WHERE purchaser_id = %s AND cafe_item_id = %s",
                [purchaser_id, item_id],
            )
            
            cursor.execute("UPDATE all_users SET account_money = account_money - %s WHERE user_id = %s", [price, purchaser_id])
            
            cursor.execute(
                "INSERT INTO buying_history(purchaser_id, course_id, cafe_item_id, cafe_id, lane_id, purchased_at) VALUES(%s, %s, %s, %s, %s, %s, %s)",
                [purchaser_id, 0, item_id, cafe_id, 0, datetime.now],
            )
            
        return JsonResponse({"message": "Item removed from cart successfully"})
class AddCourseToCartView(View):
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
    
class RemoveCourseFromCartView(View):
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
        

class WithdrawCourseView(View):
    def post(self, request):
        data = json.loads(request.body)
        swimmer_id = data.get("swimmer_id")
        course_id = data.get("course_id")

        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE FROM course_schedule SET status WHERE swimmer_id = %s AND course_id = %s",
                [swimmer_id, course_id],
            )

        return JsonResponse({"message": "Successfully withdrawn from the course"})
    
class FinishCourseView(View):
    def post(self, request):
        data = json.loads(request.body)
        course_id = data.get("course_id")
        coach_id  = data.get("coach_id")
        
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE course_schedule SET status = 'finished' WHERE course_id = %s AND coach_id=%s",
                [course_id, coach_id],
            )
            
            cursor.execute("SELECT * FROM course WHERE course_id =%s", [course_id])
            course = cursor.fetchone()
            course_price = course[9]
            
            cursor.execute("SELECT COUNT(*) FROM buying_history WHERE course_id=%s", [course_id])
            participant_count = cursor.fetchone[0]
            course_price = (course_price * participant_count * 60)/100.0
            
            cursor.execute("UPDATE all_users SET account_money = account_money + %s WHERE user_id=%s",[course_price, coach_id])

        return JsonResponse({"message": "Course marked as finished successfully"})
    

class WithdrawPersonalTrainingView(View):
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
    
class FinishPersonalTrainingView(View):
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
    
class PreviousCoursesView(View):
    def get(self, request):
        swimmer_id = request.GET.get("swimmer_id")
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM course_schedule WHERE course_schedule.swimmer_id= %s AND course_schedule.status=%s",
                    [swimmer_id, "finished"])
            courses = cursor.fetchall()

        previous_courses = []
        
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
                "price": course[9],
            }
            previous_courses.append(course)
            
        return JsonResponse({"previous_courses": previous_courses})

class PasswordChangeEmailView(View):
    def post(self, request):
        data = json.loads(request.body)
        recipient_email = data.get("email")
        
        subject = 'Password Change'
        message = 'This is a password change email'
        from_email = 'your_email@example.com'
        recipient_list = [recipient_email]

        send_mail(subject, message, from_email, recipient_list)
        return JsonResponse({"message": "Mail sended successfully"})
    
class GetAllBuyingHistoryView(View):
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
        
class GetUserBuyingHistoryView(View):
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