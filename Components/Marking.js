import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { fs } from '../Config/Config';
import { Picker } from '@react-native-picker/picker';

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
                const studentsSnapshot = await fs.collection('students').get();
                const studentsData = studentsSnapshot.docs
                    .filter(doc => doc.data().currentCourses.includes(assignCourseId))
                    .map(doc => ({
                        id: doc.id,
                        name: doc.data().name,
                    }));
                setStudents(studentsData);

                const marksDoc = await fs.collection('studentsMarks').doc(assignCourseId).get();
                const marksObject = studentsData.reduce((acc, student) => {
                    acc[student.id] = { grade: 'I' };  // Initialize with default grade 'I'
                    return acc;
                }, {});

                if (marksDoc.exists) {
                    const marksData = marksDoc.data();
                    setCriteria(marksData.criteriaDefined || []);
                    marksData.marksOfStudents.forEach(studentMarks => {
                        marksObject[studentMarks.studentId] = {
                            ...marksObject[studentMarks.studentId],  // Keep the default grade 'I'
                            ...studentMarks.marks,
                            grade: studentMarks.grade || 'I'  // Override with actual grade if it exists
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
        <ScrollView className="pt-[48px] px-4">
            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#003f92" />
                </View>
            ) : error ? (
                <Text style={styles.errorText}>Error: {saveMessage} + {error}</Text>
            ) : (
                <View>
                    <View style={styles.criteriaContainer}>
                        <Text style={styles.totalWeightage}>Total Weightage: {totalWeightage}%</Text>
                        <ScrollView horizontal className="px-2 py-4 bg-gray-100">
                            <View className="border border-gray-300 rounded-lg overflow-hidden">
                                <View className="flex-row bg-gray-200 border-b border-gray-300">
                                    <View className="w-[150px] p-2 border-r border-gray-300">
                                        <Text className="font-bold">Assessment</Text>
                                    </View>
                                    <View className="w-[150px] p-2 border-r border-gray-300">
                                        <Text className="font-bold">Weightage (%)</Text>
                                    </View>
                                    <View className="w-[150px] p-2 border-r border-gray-300">
                                        <Text className="font-bold">Total Marks</Text>
                                    </View>
                                    <View className="w-[150px] p-2">
                                        <Text className="font-bold">Actions</Text>
                                    </View>
                                </View>
                                {criteria.map((criterion, index) => (
                                    <View key={index} className="flex-row border-b border-gray-300">
                                        {editingCriteria === index ? (
                                            <View className="flex-row">
                                                <View className="w-[150px] p-2 border-r border-gray-300">
                                                    <TextInput
                                                        className="border border-gray-300 p-2 rounded"
                                                        value={criterion.assessment}
                                                        onChangeText={(text) =>
                                                            setCriteria((prev) =>
                                                                prev.map((item, i) =>
                                                                    i === index ? { ...item, assessment: text } : item
                                                                )
                                                            )
                                                        }
                                                    />
                                                </View>
                                                <View className="w-[150px] p-2 border-r border-gray-300">
                                                    <TextInput
                                                        className="border border-gray-300 p-2 rounded"
                                                        value={criterion.weightage}
                                                        keyboardType="numeric"
                                                        onChangeText={(text) =>
                                                            setCriteria((prev) =>
                                                                prev.map((item, i) =>
                                                                    i === index ? { ...item, weightage: text } : item
                                                                )
                                                            )
                                                        }
                                                    />
                                                </View>
                                                <View className="w-[150px] p-2 border-r border-gray-300">
                                                    <TextInput
                                                        className="border border-gray-300 p-2 rounded"
                                                        value={criterion.totalMarks}
                                                        keyboardType="numeric"
                                                        onChangeText={(text) =>
                                                            setCriteria((prev) =>
                                                                prev.map((item, i) =>
                                                                    i === index ? { ...item, totalMarks: text } : item
                                                                )
                                                            )
                                                        }
                                                    />
                                                </View>
                                                <View className="w-[150px] p-2">
                                                    <Button title="Update" onPress={handleSaveMarks} disabled={!allCriteriaFilled || !allMarksEntered} />
                                                </View>
                                            </View>
                                        ) : (
                                            <View className="flex-row">
                                                <View className="w-[150px] p-2 border-r border-gray-300">
                                                    <Text>{criterion.assessment}</Text>
                                                </View>
                                                <View className="w-[150px] p-2 border-r border-gray-300">
                                                    <Text>{criterion.weightage}%</Text>
                                                </View>
                                                <View className="w-[150px] p-2 border-r border-gray-300">
                                                    <Text>{criterion.totalMarks}</Text>
                                                </View>
                                                <View className="w-[150px] p-2 flex-row justify-around">
                                                    <TouchableOpacity onPress={() => handleEditCriteria(index)} className="bg-blue-500 p-1 rounded">
                                                        <Text className="text-white">Edit</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => handleDeleteCriteria(index)} className="bg-red-500 p-1 rounded">
                                                        <Text className="text-white">Delete</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </ScrollView>

                        <Text style={styles.sectionTitle}>Define Grading Criteria</Text>
                        <View>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Assessment Name"
                                value={newCriteria.assessment}
                                onChangeText={(text) => setNewCriteria({ ...newCriteria, assessment: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Assessment Weightage"
                                keyboardType="numeric"
                                value={newCriteria.weightage}
                                onChangeText={(text) => setNewCriteria({ ...newCriteria, weightage: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Expected Total Marks For the Assessment"
                                keyboardType="numeric"
                                value={newCriteria.totalMarks}
                                onChangeText={(text) => setNewCriteria({ ...newCriteria, totalMarks: text })}
                            />
                            <Button title="Add Criteria" onPress={handleAddCriteria} />
                        </View>
                    </View>

                    {criteria.length > 0 && (
                        <View style={styles.marksContainer}>
                            <Text style={styles.sectionTitle}>Marks Details</Text>
                            {/* Table-like structure */}
                            {students.map((student) => (
                                <View key={student.id} style={styles.row}>
                                    <Text className="text-blue-950  ml-[5px] font-medium">{student.name}</Text>
                                    {criteria.map((criterion, index) => (
                                        <View key={index} className="text-blue-950 ml-[5px]  font-medium">
                                            <TextInput
                                                className="text-blue-950  ml-[5px] font-medium"
                                                value={marks[student.id]?.[criterion.assessment] || ''}
                                                keyboardType="numeric"
                                                onChangeText={(text) =>
                                                    setMarks((prev) => ({
                                                        ...prev,
                                                        [student.id]: {
                                                            ...prev[student.id],
                                                            [criterion.assessment]: parseInt(text),
                                                        },
                                                    }))
                                                }
                                                editable={isEditing}
                                            />
                                            <Text className="text-blue-950 ml-[5px] font-medium">
                                                {marks[student.id]?.[criterion.assessment] !== undefined
                                                    ? ((marks[student.id][criterion.assessment] / criterion.totalMarks) * criterion.weightage).toFixed(2)
                                                    : ''}
                                            </Text>
                                        </View>
                                    ))}
                                    <Picker
                                        selectedValue={marks[student.id]?.grade || 'I'}
                                        style={styles.picker}
                                        onValueChange={(itemValue) =>
                                            setMarks((prev) => ({
                                                ...prev,
                                                [student.id]: {
                                                    ...prev[student.id],
                                                    grade: itemValue,
                                                },
                                            }))
                                        }
                                    >
                                        {grades.map((grade) => (
                                            <Picker.Item key={grade} label={grade} value={grade} />
                                        ))}
                                    </Picker>
                                </View>
                            ))}

                            <View style={styles.buttonContainer}>
                                <Button title="Save Marks" onPress={handleSaveMarks} disabled={!allCriteriaFilled || !allMarksEntered} />
                                <Button title={isEditing ? 'Stop Editing' : 'Edit Marks'} onPress={() => setIsEditing(!isEditing)} />
                            </View>
                        </View>
                    )}

                    <View style={styles.addMarksContainer}>
                        <Text style={styles.sectionTitle}>Add Marks</Text>
                        <Button title="Add-Up Marks Of Assessments" onPress={() => setIsAddingMarks(true)} />
                        {isAddingMarks && (
                            <View>
                                <Picker
                                    selectedValue={selectedAssessment}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => setSelectedAssessment(itemValue)}
                                >
                                    <Picker.Item label="Select Assessment" value="" />
                                    {criteria.map((criterion, index) => (
                                        <Picker.Item key={index} label={criterion.assessment} value={criterion.assessment} />
                                    ))}
                                </Picker>
                                {selectedAssessment && (
                                    <View>
                                        <Text style={styles.sectionTitle}>Enter Marks for {selectedAssessment}</Text>
                                        {students.map((student) => (
                                            <View key={student.id} style={styles.row}>
                                                <Text style={styles.studentName}>{student.name}</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    keyboardType="numeric"
                                                    onChangeText={(text) => handleAddMarksChange(student.id, text)}
                                                />
                                            </View>
                                        ))}
                                        <Button title="Add Results" onPress={handleSaveAddMarks} />
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            )}
            <View className="h-[55px]">

            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
    },
    criteriaContainer: {
        marginBottom: 16,
    },
    criteriaList: {
        marginBottom: 16,
    },
    criterion: {
        marginBottom: 8,
    },
    criterionDetails: {
        marginBottom: 8,
    },
    criterionText: {
        fontSize: 16,
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 8,
        marginBottom: 8,
    },
    editButton: {
        backgroundColor: '#4CAF50',
        padding: 8,
        borderRadius: 4,
        marginVertical: 4,
    },
    deleteButton: {
        backgroundColor: '#f44336',
        padding: 8,
        borderRadius: 4,
        marginVertical: 4,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    marksContainer: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    studentName: {
        flex: 1,
        fontSize: 16,
    },
    weightedMarks: {
        flex: 1,
        fontSize: 16,
        textAlign: 'center',
    },
    picker: {
        height: 50,
        width: '100%',
        marginVertical: 8,
    },
    addMarksContainer: {
        marginBottom: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});
export default Marking;