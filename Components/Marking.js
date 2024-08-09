import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, ActivityIndicator, StyleSheet, Picker, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const Marking = ({ route }) => {
    const { assignCourseId } = route.params;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [students, setStudents] = useState([]);
    const [criteria, setCriteria] = useState([]);
    const [marks, setMarks] = useState({});
    const [newCriteria, setNewCriteria] = useState({ assessment: '', weightage: '', totalMarks: '' });
    const [editingCriteria, setEditingCriteria] = useState(-1);
    const [isEditing, setIsEditing] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [isAddingMarks, setIsAddingMarks] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState('');
    const [tempMarks, setTempMarks] = useState({});

    const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I'];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const studentsSnapshot = await firestore().collection('students').get();
                const studentsData = studentsSnapshot.docs
                    .filter(doc => doc.data().currentCourses.includes(assignCourseId))
                    .map(doc => ({
                        id: doc.id,
                        name: doc.data().name,
                    }));
                setStudents(studentsData);

                const marksDoc = await firestore().collection('studentsMarks').doc(assignCourseId).get();
                const marksObject = studentsData.reduce((acc, student) => {
                    acc[student.id] = { grade: 'I' };
                    return acc;
                }, {});

                if (marksDoc.exists) {
                    const marksData = marksDoc.data();
                    setCriteria(marksData.criteriaDefined || []);
                    marksData.marksOfStudents.forEach(studentMarks => {
                        marksObject[studentMarks.studentId] = {
                            ...marksObject[studentMarks.studentId],
                            ...studentMarks.marks,
                            grade: studentMarks.grade || 'I'
                        };
                    });
                }

                setMarks(marksObject);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [assignCourseId]);

    const handleAddCriteria = () => {
        if (newCriteria.assessment && newCriteria.weightage && newCriteria.totalMarks) {
            setCriteria([...criteria, { ...newCriteria }]);
            setNewCriteria({ assessment: '', weightage: '', totalMarks: '' });
        }
    };

    const handleSaveMarks = async () => {
        try {
            const marksData = {
                criteriaDefined: criteria,
                marksOfStudents: Object.keys(marks).map((studentId) => {
                    const studentMarks = marks[studentId];
                    Object.keys(studentMarks).forEach(key => {
                        if (studentMarks[key] === undefined) {
                            delete studentMarks[key];
                        }
                    });
                    return {
                        studentId,
                        marks: studentMarks,
                        grade: studentMarks.grade,
                    };
                }),
            };

            console.log('Data to be saved:', marksData);
            setEditingCriteria(-1);
            await firestore().collection('studentsMarks').doc(assignCourseId).set(marksData);

            setSaveMessage('Marks saved successfully!');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteCriteria = (index) => {
        const assessmentToDelete = criteria[index].assessment;
        setCriteria((prev) => prev.filter((_, i) => i !== index));
        setMarks((prev) => {
            const newMarks = { ...prev };
            Object.keys(newMarks).forEach((studentId) => {
                const { [assessmentToDelete]: _, ...rest } = newMarks[studentId];
                newMarks[studentId] = rest;
            });
            return newMarks;
        });
    };

    const handleEditCriteria = (index) => {
        setEditingCriteria(index);
    };

    const handleAddMarks = () => {
        setIsAddingMarks(true);
    };

    const handleSaveAddMarks = () => {
        setMarks((prev) => {
            const newMarks = { ...prev };

            Object.keys(tempMarks).forEach((studentId) => {
                const assessmentMarks = tempMarks[studentId] || {};

                Object.keys(assessmentMarks).forEach((assessment) => {
                    const previousMarks = parseInt(newMarks[studentId]?.[assessment] || 0, 10);
                    const additionalMarks = parseInt(assessmentMarks[assessment], 10);

                    newMarks[studentId] = {
                        ...newMarks[studentId],
                        [assessment]: previousMarks + additionalMarks,
                    };

                    console.log(previousMarks);
                    console.log(additionalMarks);
                    console.log(newMarks[studentId][assessment]);
                });
            });

            return newMarks;
        });

        setTempMarks({});
        setIsAddingMarks(false);
    };

    const handleAddMarksChange = (studentId, value) => {
        setTempMarks((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [selectedAssessment]: parseInt(value),
            },
        }));
    };

    const totalWeightage = criteria.reduce((total, item) => total + parseFloat(item.weightage), 0);

    const allCriteriaFilled = criteria.every(c => c.assessment && c.weightage && c.totalMarks);
    const allMarksEntered = students.every(student => criteria.every(c => marks[student.id]?.[c.assessment] !== undefined));

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#003f92" />
                </View>
            ) : error ? (
                <Text style={styles.errorText}>Error: {saveMessage} {error}</Text>
            ) : (
                <View>
                    <View style={styles.criteriaContainer}>
                        <Text style={styles.header}>Total Weightage: {totalWeightage}%</Text>
                        <ScrollView horizontal>
                            {criteria.map((criterion, index) => (
                                <View key={index} style={styles.criteria}>
                                    {editingCriteria === index ? (
                                        <View>
                                            <TextInput
                                                style={styles.input}
                                                value={criterion.assessment}
                                                onChangeText={(text) => setCriteria((prev) =>
                                                    prev.map((item, i) =>
                                                        i === index ? { ...item, assessment: text } : item
                                                    )
                                                )}
                                            />
                                            <TextInput
                                                style={styles.input}
                                                keyboardType="numeric"
                                                value={criterion.weightage}
                                                onChangeText={(text) => setCriteria((prev) =>
                                                    prev.map((item, i) =>
                                                        i === index ? { ...item, weightage: text } : item
                                                    )
                                                )}
                                            />
                                            <TextInput
                                                style={styles.input}
                                                keyboardType="numeric"
                                                value={criterion.totalMarks}
                                                onChangeText={(text) => setCriteria((prev) =>
                                                    prev.map((item, i) =>
                                                        i === index ? { ...item, totalMarks: text } : item
                                                    )
                                                )}
                                            />
                                            <Button title="Update Criteria" onPress={handleSaveMarks} disabled={!allCriteriaFilled || !allMarksEntered} />
                                        </View>
                                    ) : (
                                        <View style={styles.criteriaDetails}>
                                            <Text>Assessment Name: {criterion.assessment}</Text>
                                            <Text>Weightage: {criterion.weightage}%</Text>
                                            <Text>Total Marks: {criterion.totalMarks}</Text>
                                            <Button title="Edit" onPress={() => handleEditCriteria(index)} />
                                            <Button title="Delete" onPress={() => handleDeleteCriteria(index)} />
                                        </View>
                                    )}
                                </View>
                            ))}
                        </ScrollView>

                        <Text style={styles.header}>Define Grading Criteria</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Assessment Name"
                            value={newCriteria.assessment}
                            onChangeText={(text) => setNewCriteria({ ...newCriteria, assessment: text })}
                        />
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="Enter Assessment Weightage"
                            value={newCriteria.weightage}
                            onChangeText={(text) => setNewCriteria({ ...newCriteria, weightage: text })}
                        />
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="Enter Expected Total Marks For the Assessment"
                            value={newCriteria.totalMarks}
                            onChangeText={(text) => setNewCriteria({ ...newCriteria, totalMarks: text })}
                        />
                        <Button title="Add Criteria" onPress={handleAddCriteria} disabled={!newCriteria.assessment || !newCriteria.weightage || !newCriteria.totalMarks} />

                        <Text style={styles.header}>Add Marks</Text>
                        {isAddingMarks ? (
                            <View>
                                <Picker
                                    selectedValue={selectedAssessment}
                                    onValueChange={(itemValue) => setSelectedAssessment(itemValue)}
                                >
                                    {criteria.map((criterion, index) => (
                                        <Picker.Item key={index} label={criterion.assessment} value={criterion.assessment} />
                                    ))}
                                </Picker>

                                {students.map(student => (
                                    <View key={student.id} style={styles.marksContainer}>
                                        <Text>{student.name}</Text>
                                        <TextInput
                                            style={styles.input}
                                            keyboardType="numeric"
                                            placeholder="Enter Marks"
                                            onChangeText={(value) => handleAddMarksChange(student.id, value)}
                                        />
                                    </View>
                                ))}
                                <Button title="Save Marks" onPress={handleSaveAddMarks} />
                            </View>
                        ) : (
                            <Button title="Add Marks" onPress={handleAddMarks} />
                        )}
                    </View>
                    {saveMessage && <Text style={styles.successMessage}>{saveMessage}</Text>}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
    },
    criteriaContainer: {
        marginVertical: 10,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    criteria: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 10,
    },
    criteriaDetails: {
        marginBottom: 10,
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
    },
    marksContainer: {
        marginBottom: 10,
    },
    successMessage: {
        color: 'green',
        textAlign: 'center',
    },
});

export default Marking;
