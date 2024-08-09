import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, ActivityIndicator, Picker, StyleSheet, ScrollView } from 'react-native';
import { fs } from '../Config/Config';
import StudentAttendance from './StudentAttendance';
import EditAttendance from './EditAttendance'; 

const Attendance = ({ route }) => {
  const { assignCourseId } = route.params;
  const [courseData, setCourseData] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [latestAttendance, setLatestAttendance] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [editForm, setEditForm] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const assignmentDoc = await fs.collection('assignCourses').doc(assignCourseId).get();
        if (assignmentDoc.exists) {
          const assignmentData = assignmentDoc.data();

          const courseDoc = await fs.collection('courses').doc(assignmentData.courseId).get();
          setCourseData({
            courseName: courseDoc.data().name,
            courseId: assignmentData.courseId,
          });

          const studentsSnapshot = await fs.collection('students').get();
          const studentsList = studentsSnapshot.docs
            .filter(doc => doc.data().currentCourses.includes(assignCourseId))
            .map(doc => ({
              id: doc.id,
              name: doc.data().name,
            }));

          setStudents(studentsList);

          const attendanceDocRef = fs.collection('attendances').doc(assignCourseId);
          const attendanceDoc = await attendanceDocRef.get();

          if (attendanceDoc.exists) {
            const attendanceData = attendanceDoc.data().attendances;
            setAttendanceDates(attendanceData.map(record => record.date));

            if (attendanceData.length > 0) {
              const latest = attendanceData.reduce((latestRecord, currentRecord) => {
                return new Date(latestRecord.date) > new Date(currentRecord.date) ? latestRecord : currentRecord;
              });
              setLatestAttendance(latest);
            }
          }
        } else {
          setError('No assignment data found');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [assignCourseId]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    setFormLoading(true);
    try {
      const attendanceDocRef = fs.collection('attendances').doc(assignCourseId);
      const attendanceDoc = await attendanceDocRef.get();

      if (attendanceDoc.exists) {
        await attendanceDocRef.update({
          attendances: [...attendanceDoc.data().attendances, {
            date: selectedDate,
            records: attendance,
          }],
        });
      } else {
        await attendanceDocRef.set({
          assignCourseId: assignCourseId,
          attendances: [
            {
              date: selectedDate,
              records: attendance,
            },
          ],
        });
      }

      setSelectedDate('');
      setAttendance({});

      const updatedAttendanceDoc = await attendanceDocRef.get();
      if (updatedAttendanceDoc.exists) {
        const updatedAttendanceData = updatedAttendanceDoc.data().attendances;
        const latest = updatedAttendanceData.reduce((latestRecord, currentRecord) => {
          return new Date(latestRecord.date) > new Date(currentRecord.date) ? latestRecord : currentRecord;
        });
        setLatestAttendance(latest);
        setAttendanceDates(updatedAttendanceData.map(record => record.date));
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const isSaveEnabled = () => {
    if (!selectedDate) return false;
    if (students.length === 0) return false;
    for (const student of students) {
      if (!attendance.hasOwnProperty(student.id)) return false;
    }
    return true;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#003F92" />
      </View>
    );
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      {courseData && (
        <>
          <Text style={styles.courseTitle}>{courseData.courseName} Attendance</Text>
          <View style={styles.separator}></View>
        </>
      )}

      {formLoading ? (
        <Text>Loading...</Text>
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.header}>Mark Attendance</Text>

          <Text>Select Date:</Text>
          <TextInput
            style={styles.input}
            placeholder="Select Date"
            value={selectedDate}
            onChangeText={setSelectedDate}
          />
          <FlatList
            data={students}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <StudentAttendance
                student={item}
                attendance={attendance}
                onAttendanceChange={handleAttendanceChange}
              />
            )}
          />
          <Button
            title="Save Attendance"
            onPress={handleSaveAttendance}
            disabled={!isSaveEnabled()}
          />
        </View>
      )}

      <Button
        title={editForm ? 'Close Review' : 'Show Attendance Records'}
        onPress={() => setEditForm(!editForm)}
      />
      {editForm && (
        <EditAttendance
          assignCourseId={assignCourseId}
          students={students}
          attendanceDates={attendanceDates}
          latestAttendance={latestAttendance}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003F92',
    textAlign: 'center',
    marginVertical: 12,
  },
  separator: {
    width: '95%',
    height: 2,
    backgroundColor: '#003F92',
    alignSelf: 'center',
    marginBottom: 15,
  },
  formContainer: {
    marginVertical: 8,
    padding: 15,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
  },
  header: {
    fontSize: 20,
    color: '#003F92',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    borderColor: '#003F92',
    borderWidth: 2,
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
});

export default Attendance;
