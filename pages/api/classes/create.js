import dbConnect from "../../../lib/dbConnect";
import { requireAuth } from "../../../lib/auth";
import User from "../../../lib/models/User";
import Class from "../../../lib/models/Class";
import ClassSchedule from "../../../lib/models/ClassSchedule";
import Notification from "../../../lib/models/Notification";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  if (user.role !== "teacher" && user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only teachers or admins can create classes" });
  }

  try {
    await dbConnect();
    const {
      title,
      description,
      scheduledTime,
      duration,
      teacherId,
      studentIds,
      maxStudents,
      courseType,
    } = req.body;

    const assignedTeacher =
      user.role === "admin" && teacherId ? teacherId : user._id;
    const roomId = uuidv4();

    const newClass = new Class({
      title,
      description,
      teacher: assignedTeacher,
      scheduledTime,
      duration: duration || 60,
      roomId,
      maxStudents: maxStudents || 10,
      courseType: courseType || "General",
      enrolledStudents: Array.isArray(studentIds) ? studentIds : [],
    });
    await newClass.save();
    await newClass.populate("teacher", "name email");
    await newClass.populate("enrolledStudents", "name email");

    const teacher = await User.findById(assignedTeacher);
    const teacherName = teacher ? teacher.name : "Teacher";
    const classDuration = duration || 60;
    const schedDate = new Date(scheduledTime);

    const courseTypeMap = {
      "Quran Nazra": "Nazra",
      "Quran Tajweed": "Tajweed",
      "Quran Hifz": "Hifz",
      "Namaz & Duas": "Translation",
      "Islamic Studies": "Tafseer",
      General: "Nazra",
    };
    const scheduleCourseType = courseTypeMap[courseType] || "Nazra";

    const fmtDate = schedDate.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const enrolledIds = Array.isArray(studentIds) ? studentIds : [];

    for (const sid of enrolledIds) {
      try {
        const schedule = new ClassSchedule({
          userId: sid,
          teacherId: assignedTeacher,
          courseType: scheduleCourseType,
          teacherName,
          scheduledDate: schedDate,
          duration: classDuration,
          status: "scheduled",
          roomId,
          notes: description || "",
        });
        await schedule.save();

        if (teacher) {
          const alreadyAssigned = (teacher.assignedStudents || []).some(
            (s) => s.toString() === sid.toString(),
          );
          if (!alreadyAssigned) {
            teacher.assignedStudents = teacher.assignedStudents || [];
            teacher.assignedStudents.push(sid);
          }
        }
        const student = await User.findById(sid);
        if (
          student &&
          (!student.assignedTeacher ||
            student.assignedTeacher.toString() !== assignedTeacher.toString())
        ) {
          student.assignedTeacher = assignedTeacher;
          await student.save();
        }

        await Notification.create({
          userId: sid,
          type: "class_scheduled",
          title: "New Class Scheduled",
          message: `Your ${courseType || "General"} class "${title}" with ${teacherName} is scheduled for ${fmtDate} (${classDuration} min).`,
          metadata: {
            classId: schedule._id,
            courseType: scheduleCourseType,
            scheduledDate: schedDate,
            teacherName,
            roomId,
          },
        });
      } catch (innerErr) {
        console.error(
          `Error creating schedule/notification for student ${sid}:`,
          innerErr,
        );
      }
    }

    if (teacher && enrolledIds.length > 0) {
      await teacher.save();
    }

    if (
      user.role === "admin" &&
      assignedTeacher &&
      assignedTeacher.toString() !== user._id.toString()
    ) {
      try {
        const studentNames = newClass.enrolledStudents
          .map((s) => s.name)
          .join(", ");
        await Notification.create({
          userId: assignedTeacher,
          type: "class_scheduled",
          title: "New Class Assigned",
          message: `Admin scheduled "${title}" (${courseType || "General"}) for ${fmtDate} (${classDuration} min).${studentNames ? ` Students: ${studentNames}` : ""}`,
          metadata: {
            courseType: scheduleCourseType,
            scheduledDate: schedDate,
            teacherName,
            roomId,
          },
        });
      } catch (notifErr) {
        console.error("Error notifying teacher:", notifErr);
      }
    }

    res
      .status(201)
      .json({
        message: "Class created and notifications sent",
        class: newClass,
      });
  } catch (error) {
    console.error("Create class error:", error);
    res
      .status(500)
      .json({ message: "Failed to create class", error: error.message });
  }
}
