import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { fs } from '../Config/Config';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

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

            //console.log('Data to be saved:', marksData);
            setEditingCriteria(-1);
            await fs.collection('studentsMarks').doc(assignCourseId).set(marksData);

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

    //const allCriteriaFilled = criteria.every(c => c.assessment && c.weightage && c.totalMarks);
    //const allMarksEntered = students.every(student => criteria.every(c => marks[student.id]?.[c.assessment] !== undefined));

    return (
        <ScrollView className="pt-[48px] px-4">

            <Ionicons name="arrow-back" onPress={() => navigation.goBack()} size={26} color="#003F92" />
            <View className="w-[100%] h-[2px] bg-blue-800 self-center my-4"></View>

            {loading ? (
                <View >
                    <ActivityIndicator size="large" color="#003f92" />
                </View>
            ) : error ? (
                <Text >Error: {saveMessage} + {error}</Text>
            ) : (
                <View>
                    {criteria.length > 0 && (
                                <View>
                                    
                        <View className="flex-row mb-[15px] items-center">
                            <View className="h-[12px] w-[12px] mt-[2px] rounded-full bg-blue-700"></View>
                            <Text className="text-xl font-bold un text-blue-900 ">  Students Marks Details</Text>
                        </View>
                            {/* Table-like structure */}
                            <ScrollView horizontal={true} className="flex">
                                <View className="flex-col border border-gray-300 rounded-lg">
                                    {/* 
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

                                     */}

                                    <View className="flex-row bg-gray-200 border-b border-gray-300">
                                        <View className="w-[150px] p-2 border-r border-gray-300">
                                            <Text className="font-bold">Student Name</Text>
                                        </View>
                                        {criteria.map((criterion, index) => (
                                            <View key={index} className="w-[120px] p-2 border-r border-gray-300">
                                                <Text className="font-bold"> {criterion.assessment}</Text>
                                            </View>
                                        ))}
                                        {criteria.map((criterion, index) => (
                                            <View key={index} className="w-[220px] p-2 border-r border-gray-300">
                                                <Text className="font-bold"> {criterion.assessment} Weightage (%)</Text>
                                            </View>
                                        ))}
                                        <View className="w-[150px] p-2">
                                            <Text className="font-bold">Grade</Text>
                                        </View>
                                    </View>


                                    {students.map((student) => (
                                        <View key={student.id} className="flex-row bg-white border-b border-gray-300">
                                            {/*<Text className="text-center p-2 flex-1"></Text> */}
                                            <View className="w-[150px] p-2 border-r border-gray-300">
                                                <Text className="font-bold">{student.name}</Text>
                                            </View>
                                            {criteria.map((criterion, index) => (
                                                <View key={index} className="w-[120px] p-2 border-r border-gray-300">
                                                    {isEditing ?
                                                        <TextInput
                                                            className="font-bold border text-center border-blue-950 rounded-xl"
                                                            value={marks[student.id]?.[criterion.assessment]?.toString() || ''}
                                                            keyboardType="numeric"
                                                            onChangeText={(text) => {
                                                                const parsedValue = text ? parseInt(text, 10) : '';
                                                                setMarks((prev) => ({
                                                                    ...prev,
                                                                    [student.id]: {
                                                                        ...prev[student.id],
                                                                        [criterion.assessment]: parsedValue,
                                                                    },
                                                                }));
                                                            }}
                                                            editable={isEditing}
                                                        />
                                                        :
                                                        <Text className="font-bold">
                                                            {marks[student.id]?.[criterion.assessment] || ''}
                                                        </Text>
                                                    }

                                                    {/*
                                                    <Text className="text-center p-2">
                                                        {marks[student.id]?.[criterion.assessment] !== undefined
                                                            ? (
                                                                (marks[student.id][criterion.assessment] / criterion.totalMarks) * criterion.weightage
                                                            ).toFixed(2)
                                                            : ''}
                                                    </Text>
                                                     */}
                                                </View>
                                            ))}

                                            {criteria.map((criterion, index) => (
                                                <View key={index} className="w-[220px] p-2 border-r border-gray-300">
                                                    <Text className="font-semibold">
                                                        {marks[student.id]?.[criterion.assessment] !== undefined
                                                            ? (
                                                                (marks[student.id][criterion.assessment] / criterion.totalMarks) * criterion.weightage
                                                            ).toFixed(2)
                                                            : ''}
                                                    </Text>
                                                </View>
                                            ))}

                                            <Picker
                                                selectedValue={marks[student.id]?.grade || 'I'}
                                                style={{ width: 150, color: 'blue', fontWeight: 'bold', borderColor: 'gray', borderWidth: 1 }}
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

                                    {/* Data Rows 
                                    {students.map((student) => (
                                        <View key={student.id} className="flex-row border-b border-gray-300 p-2">
                                            <Text className="text-center p-2 flex-1">{student.name}</Text>
                                            {criteria.map((criterion, index) => (
                                                <View key={index} className="flex-col flex-1">
                                                    <TextInput
                                                        className="text-center border border-gray-300 p-2"
                                                        value={marks[student.id]?.[criterion.assessment]?.toString() || ''}
                                                        keyboardType="numeric"
                                                        onChangeText={(text) => {
                                                            const parsedValue = text ? parseInt(text, 10) : '';
                                                            setMarks((prev) => ({
                                                                ...prev,
                                                                [student.id]: {
                                                                    ...prev[student.id],
                                                                    [criterion.assessment]: parsedValue,
                                                                },
                                                            }));
                                                        }}
                                                        editable={isEditing}
                                                    />
                                                    <Text className="text-center p-2">
                                                        {marks[student.id]?.[criterion.assessment] || ''}
                                                    </Text>
                                                    <Text className="text-center p-2">
                                                        {marks[student.id]?.[criterion.assessment] !== undefined
                                                            ? (
                                                                (marks[student.id][criterion.assessment] / criterion.totalMarks) * criterion.weightage
                                                            ).toFixed(2)
                                                            : ''}
                                                    </Text>
                                                </View>
                                            ))}
                                            <Picker
                                                selectedValue={marks[student.id]?.grade || 'I'}
                                                className="flex-1 h-10"
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
                                */}
                                </View>
                            </ScrollView>

                            {/*  <View className="mt-[15px] flex-row space-x-4">
                                <Button title="Save Marks" onPress={handleSaveMarks} disabled={!allCriteriaFilled || !allMarksEntered} />
                                <Button title={isEditing ? 'Stop Editing' : 'Edit Marks'} onPress={() => setIsEditing(!isEditing)} />
                                    </View> */}
                            <View className="mt-[15px] flex-row justify-between">
                                <TouchableOpacity onPress={handleSaveMarks} className="bg-blue-600  mb-[20px] rounded-lg px-2 py-1">
                                    <Text className="font-bold text-md text-center text-white">Save Marks</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setIsEditing(!isEditing)} className="bg-red-500  mb-[20px] rounded-lg px-2 py-1">
                                    <Text className="font-bold text-md text-center text-white">{isEditing ? 'Stop Editing' : 'Edit Marks'}</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    )}
                    <View className="w-[100%] h-[2px] bg-gray-400 self-center my-3"></View>
                    <View className="flex-row mb-[15px] items-center">
                        <View className="h-[12px] w-[12px] mt-[2px] rounded-full bg-blue-700"></View>
                        <Text className="text-xl font-bold un text-blue-900 ">  Add Marks</Text>
                    </View>

                    <View className="p-3 bg-white border border-gray-400 rounded-lg mb-[15px]">
                        {/*<Button title="Add-Up Marks Of Assessments" onPress={() => setIsAddingMarks(true)} /> */}
                        <TouchableOpacity onPress={() => setIsAddingMarks(true)} className="bg-blue-200 mb-[20px] rounded-lg border border-blue-600 py-2">
                            <Text className="font-bold text-lg text-center text-blue-700">Add-Up Marks Of Assessments</Text>
                        </TouchableOpacity>
                        {isAddingMarks && (
                            <View>

                                <View className="bg-blue-950 rounded-lg">
                                    <Picker
                                        selectedValue={selectedAssessment}
                                        style={{ color: 'white', fontWeight: 'bold', borderColor: 'gray', borderWidth: 1 }}
                                        onValueChange={(itemValue) => setSelectedAssessment(itemValue)}
                                    >
                                        <Picker.Item label="Select Assessment" value="" />
                                        {criteria.map((criterion, index) => (
                                            <Picker.Item key={index} label={criterion.assessment} value={criterion.assessment} />
                                        ))}
                                    </Picker>
                                </View>
                                {selectedAssessment && (
                                    <View>
                                        <Text className="text-[15px] font-semibold underline mt-[12px] text-blue-700 ">Enter Marks for {selectedAssessment}</Text>
                                        {students.map((student) => (
                                            <View key={student.id} className="flex-row items-center my-[12px] bg-gray-200 rounded-lg py-1 px-2 justify-between">
                                                <Text className="text-lg font-medium">{student.name}</Text>
                                                <TextInput
                                                    className="border-gray-500 border my-[4px] w-[150px] rounded-md p-1"
                                                    keyboardType="numeric"
                                                    onChangeText={(text) => handleAddMarksChange(student.id, text)}
                                                />
                                            </View>
                                        ))}
                                        {/*<Button title="Add Results" onPress={handleSaveAddMarks} /> */}
                                        <TouchableOpacity onPress={handleSaveAddMarks} className="bg-green-900 w-[200px] mx-auto py-1 mb-[12px] rounded-lg">
                                            <Text className="font-bold text-lg text-center text-white">Update</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    <View className="w-[100%] h-[2px] bg-gray-400 self-center my-3"></View>

                    <View>
                        <View className="flex-row mb-[15px] items-center">
                            <View className="h-[12px] w-[12px] mt-[2px] rounded-full bg-blue-700"></View>
                            <Text className="text-xl font-bold un text-blue-900 ">  Edit Grading Criteria</Text>
                        </View>

                        <Text className="font-medium text-lg p-2 rounded-md bg-gray-300 text-gray-500">Total Weightage: <Text className="text-gray-700 font-extrabold">{totalWeightage}%</Text></Text>
                        {totalWeightage < 100 ?
                            <Text className="text-red-600 text-md font-medium mt-2">For accurate Result kindly make the Criteria for 100 Absolutes *</Text> : <></>
                        }
                        <ScrollView horizontal className="py-4 bg-gray-100">
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
                                                        className="border border-gray-300 p-1 rounded-md"
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
                                                        className="border border-gray-300 p-1 rounded-md"
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
                                                        className="border border-gray-300 p-1 rounded-md"
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
                                                {/* <View className="w-[150px] p-2">
                                                    <Button title="Update" onPress={handleSaveMarks} disabled={!allCriteriaFilled || !allMarksEntered} />
                                                </View> */}
                                                <TouchableOpacity onPress={handleSaveMarks} className="bg-green-700 w-[100px] ml-[30px] my-[12px] rounded-lg">
                                                    <Text className="font-bold text-sm mt-[4px] text-center text-white">Update</Text>
                                                </TouchableOpacity>

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
                                                    <TouchableOpacity onPress={() => handleEditCriteria(index)} className="bg-blue-500 px-[15px] py-1 rounded">
                                                        <Text className="text-white">Edit</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => handleDeleteCriteria(index)} className="bg-red-500 px-[8px] py-1 rounded">
                                                        <Text className="text-white">Delete</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </ScrollView>

                        <View className="w-[100%] h-[2px] bg-gray-400 self-center mt-4"></View>

                        <View className="flex-row my-[15px] items-center">
                            <View className="h-[12px] w-[12px] mt-[2px] rounded-full bg-blue-700"></View>
                            <Text className="text-xl font-bold text-blue-900 ">  Define Grading Criteria</Text>
                        </View>
                        <View>
                            <TextInput
                                className="border rounded-md border-gray-400 p-2 mb-[12px]"
                                placeholder="Enter Assessment Name"
                                value={newCriteria.assessment}
                                onChangeText={(text) => setNewCriteria({ ...newCriteria, assessment: text })}
                            />
                            <TextInput
                                className="border rounded-md border-gray-400 p-2 mb-[12px]"
                                placeholder="Enter Assessment Weightage"
                                keyboardType="numeric"
                                value={newCriteria.weightage}
                                onChangeText={(text) => setNewCriteria({ ...newCriteria, weightage: text })}
                            />
                            <TextInput
                                className="border rounded-md border-gray-400 p-2 mb-[12px]"
                                placeholder="Enter Expected Total Marks For the Assessment"
                                keyboardType="numeric"
                                value={newCriteria.totalMarks}
                                onChangeText={(text) => setNewCriteria({ ...newCriteria, totalMarks: text })}
                            />
                            <TouchableOpacity onPress={handleAddCriteria} className="bg-green-700  mb-[20px] rounded-lg p-2">
                                <Text className="font-bold text-lg text-center text-white">Add Criteria</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            )}
            <View className="h-[55px]"></View>
        </ScrollView>
    );
};

export default Marking;