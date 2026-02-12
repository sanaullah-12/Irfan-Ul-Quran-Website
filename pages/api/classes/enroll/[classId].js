import dbConnect from "../../../../lib/dbConnect";
import { requireAuth } from "../../../../lib/auth";
import User from "../../../../lib/models/User";
import Class from "../../../../lib/models/Class";
import ClassSchedule from "../../../../lib/models/ClassSchedule";
import Notification from "../../../../lib/models/Notification";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    await dbConnect();
    const { classId } = req.query;
    const classItem = await Class.findById(classId).populate(
      "teacher",
      "name email",
    );

    if (!classItem) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (classItem.enrolledStudents.includes(user._id)) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    if (classItem.enrolledStudents.length >= classItem.maxStudents) {
      return res.status(400).json({ message: "Class is full" });
    }

    classItem.enrolledStudents.push(user._id);
    await classItem.save();

    const courseTypeMap = {
      "Quran Nazra": "Nazra",
      "Quran Tajweed": "Tajweed",
      "Quran Hifz": "Hifz",
      "Namaz & Duas": "Translation",
      "Islamic Studies": "Tafseer",
      General: "Nazra",
    };
    const scheduleCourseType = courseTypeMap[classItem.courseType] || "Nazra";
    const teacherName = classItem.teacher?.name || "Teacher";

    const schedule = new ClassSchedule({
      userId: user._id,
      teacherId: classItem.teacher?._id,
      courseType: scheduleCourseType,
      teacherName,
      scheduledDate: classItem.scheduledTime,
      duration: classItem.duration,
      status: "scheduled",
      roomId: classItem.roomId,
      notes: classItem.description || "",
    });
    await schedule.save();

    const fmtDate = new Date(classItem.scheduledTime).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    await Notification.create({
      userId: user._id,
      type: "class_scheduled",
      title: "Enrolled in Class",
      message: `You enrolled in "${classItem.title}" with ${teacherName} on ${fmtDate} (${classItem.duration} min).`,
      metadata: {
        classId: schedule._id,
        courseType: scheduleCourseType,
        scheduledDate: classItem.scheduledTime,
        teacherName,
        roomId: classItem.roomId,
      },
    });

    if (classItem.teacher?._id) {
      const student = await User.findById(user._id);
      await Notification.create({
        userId: classItem.teacher._id,
        type: "class_scheduled",
        title: "New Student Enrolled",
        message: `${student?.name || "A student"} enrolled in your class "${classItem.title}" on ${fmtDate}.`,
        metadata: {
          classId: schedule._id,
          courseType: scheduleCourseType,
          scheduledDate: classItem.scheduledTime,
          teacherName,
          roomId: classItem.roomId,
        },
      });
    }

    res.json({ message: "Enrolled successfully", class: classItem });
  } catch (error) {
    console.error("Enroll error:", error);
    res.status(500).json({ message: "Failed to enroll", error: error.message });
  }
}
