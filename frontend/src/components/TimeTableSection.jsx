import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';

const TimeTableSection = () => {
    const [showAddTimetable, setShowAddTimetable] = useState(false);
    const params = useParams();

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday'];

    const [branches, setBranches] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [collegeData, setCollegeData] = useState({});
    const [timetableData, setTimetableData] = useState([]);

    useEffect(() => {
        const getTeachers = async () => {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8000/api/teachers/college/${params.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await response.json();
            if (response.ok) {
                setTeachers(data.teachers || []);
            } else {
                console.error("Failed to fetch teachers:", data);
            }
        };

        const getCollege = async () => {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8000/api/colleges/${params.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await response.json();
            if (response.ok) {
                setCollegeData(data);
            } else {
                console.error("Failed to fetch college:", data);
            }
        };

        const fetchBranches = async () => {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8000/api/branches/get/${params.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setBranches(data.branches || []);
            } else {
                console.error("Failed to fetch branches");
            }
        };

        const getTimetables = async () => {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8000/api/timetables/get/${params.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await response.json();
            setTimetableData(data.timetables || []);

            if (!response.ok) {
                console.error("Failed to fetch timetables:", data);
            }
        };

        getTimetables();
        fetchBranches();
        getCollege();
        getTeachers();
    }, [params.id]);

    const [newSchedule, setNewSchedule] = useState({
        branchId: '',
        slots: daysOfWeek.map((day) => ({
            day,
            periods: [],
        })),
    });

    const handleBranchChange = (value) => {
        const selectedBranch = branches.find(b => b._id === value);
        if (selectedBranch) {
            setNewSchedule({ ...newSchedule, branchId: selectedBranch._id });
        }
    };

    const handleAddPeriod = (dayIndex) => {
        const updatedSlots = [...newSchedule.slots];
        updatedSlots[dayIndex].periods.push({
            periodNumber: updatedSlots[dayIndex].periods.length + 1,
            subject: '',
            teacherId: '',
            startTime: '',
            endTime: '',
        });
        setNewSchedule({ ...newSchedule, slots: updatedSlots });
    };

    const handleRemovePeriod = (dayIndex, periodIndex) => {
        const updatedSlots = [...newSchedule.slots];
        updatedSlots[dayIndex].periods.splice(periodIndex, 1);
        setNewSchedule({ ...newSchedule, slots: updatedSlots });
    };

    const handlePeriodChange = (dayIndex, periodIndex, field, value) => {
        const updatedSlots = [...newSchedule.slots];
        if (field === 'teacherId') {
            updatedSlots[dayIndex].periods[periodIndex].teacherId = value;
        } else {
            updatedSlots[dayIndex].periods[periodIndex][field] = value;
        }
        setNewSchedule({ ...newSchedule, slots: updatedSlots });
    };

    const handleAddWeeklyTimetable = async () => {
        const finalData = {
            collegeId : params.id,
            branchId: newSchedule.branchId,
            slots: newSchedule.slots
                .filter(slot => slot.periods.length > 0)
                .map(slot => ({
                    day: slot.day,
                    periods: slot.periods.map(period => ({
                        periodNumber: period.periodNumber,
                        subject: period.subject,
                        teacherId: period.teacherId,
                        startTime: period.startTime,
                        endTime: period.endTime,
                    })),
                })),
        };

        console.log('Final data to be sent to backend:', finalData);

        const token = localStorage.getItem("token");
        const response = await fetch('http://localhost:8000/api/timetables/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(finalData),
        });

        const data = await response.json();
        if (response.ok) {
            console.log('Timetable created successfully:', data);
        }

        setShowAddTimetable(false);
        setNewSchedule({
            branchId: '',
            slots: daysOfWeek.map((day) => ({ day, periods: [] })),
        });
    };

    return (
        <div className="h-full overflow-y-auto p-8 animate-in fade-in-0 slide-in-from-right-4 duration-500">
            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-5xl font-extrabold text-white mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: 900, letterSpacing: '-0.02em' }}>Timetable Management</h1>
                        <p className="text-white/80 text-lg">Manage class schedules and periods</p>
                    </div>
                    
                    {/* Add Weekly Schedule Dialog */}
                    <Dialog open={showAddTimetable} onOpenChange={setShowAddTimetable}>
                        <DialogTrigger asChild>
                            <Button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 font-medium py-3 px-6 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2">
                                <PlusCircle className="w-5 h-5" />
                                Add Weekly Schedule
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-black/80 backdrop-blur-2xl border border-white/20 text-white max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
                            <DialogHeader className="pb-4 border-b border-white/10">
                                <DialogTitle className="text-2xl font-bold text-white">Add Full Weekly Schedule</DialogTitle>
                                <DialogDescription className="text-white/70 mt-2">
                                    Create a new full weekly timetable for a branch
                                </DialogDescription>
                            </DialogHeader>

                    <div className="space-y-6 py-4">

                            {/* Branch Selection */}
                            <div className="space-y-2">
                                <Label className="text-white font-medium">Branch</Label>
                                <Select
                                    value={newSchedule.branchId}
                                    onValueChange={handleBranchChange}
                                >
                                    <SelectTrigger className="bg-white/10 border-white/20 text-white h-11">
                                        <SelectValue placeholder="Select branch" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black/80 backdrop-blur-xl border-white/20 text-white">
                                        {branches.map((branch) => (
                                            <SelectItem
                                                key={branch._id}
                                                value={branch._id}
                                                className="hover:bg-white/10 focus:bg-white/10"
                                            >
                                                {branch.branchName} ({branch.year} yr, Sec {branch.section})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Timetable Slots for each day */}
                            <div className="space-y-4">
                                {newSchedule.slots.map((daySlot, dayIndex) => (
                                    <div key={daySlot.day} className="p-5 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold text-white">{daySlot.day}</h3>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAddPeriod(dayIndex)}
                                                className="text-white border-white/30 hover:bg-white/10"
                                            >
                                                <PlusCircle className="w-4 h-4 mr-2" /> Add Period
                                            </Button>
                                        </div>

                                        {daySlot.periods.length > 0 && (
                                            <div className="space-y-4">
                                                {daySlot.periods.map((period, periodIndex) => (
                                                    <div key={periodIndex} className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 relative">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemovePeriod(dayIndex, periodIndex)}
                                                            className="absolute top-3 right-3 p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-full"
                                                        >
                                                            <MinusCircle className="w-4 h-4" />
                                                        </Button>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-white">Subject</Label>
                                                                <Input
                                                                    placeholder="Subject name"
                                                                    className="bg-white/10 border-white/20 text-white placeholder-white/60"
                                                                    value={period.subject}
                                                                    onChange={(e) => handlePeriodChange(dayIndex, periodIndex, 'subject', e.target.value)}
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label className="text-white">Teacher</Label>
                                                                <Select
                                                                    value={period.teacherId}
                                                                    onValueChange={(value) => handlePeriodChange(dayIndex, periodIndex, 'teacherId', value)}
                                                                >
                                                                    <SelectTrigger className="bg-white/10 border-white/20 text-white h-10">
                                                                        <SelectValue placeholder="Assign teacher" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="bg-black/80 backdrop-blur-xl border-white/20 text-white">
                                                                        {teachers.map((teacher) => (
                                                                            <SelectItem key={teacher._id} value={teacher._id} className="hover:bg-white/10">
                                                                                {teacher.fullName}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label className="text-white">Start Time</Label>
                                                                <Input
                                                                    type="time"
                                                                    className="bg-white/10 border-white/20 text-white"
                                                                    value={period.startTime}
                                                                    onChange={(e) => handlePeriodChange(dayIndex, periodIndex, 'startTime', e.target.value)}
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label className="text-white">End Time</Label>
                                                                <Input
                                                                    type="time"
                                                                    className="bg-white/10 border-white/20 text-white"
                                                                    value={period.endTime}
                                                                    onChange={(e) => handlePeriodChange(dayIndex, periodIndex, 'endTime', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {daySlot.periods.length === 0 && (
                                            <div className="text-center py-6 text-white/60 bg-white/5 rounded-lg border border-dashed border-white/20">
                                                <PlusCircle className="w-8 h-8 mx-auto mb-2 opacity-60" />
                                                <p>No periods added yet</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-white/10">
                                <Button
                                    onClick={() => setShowAddTimetable(false)}
                                    className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddWeeklyTimetable}
                                    className="flex-1 bg-white/20 hover:bg-white/30 text-white border border-white/30"
                                    disabled={!newSchedule.branchId}
                                >
                                    Add Weekly Timetable
                                </Button>
                            </div>
                    </div>
                </DialogContent>
            </Dialog>

                {/* Timetable Display Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Active Timetables</h2>

                    {timetableData.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-white/60">No timetables found. Create one to get started!</p>
                        </div>
                    ) : (
                        timetableData.map((timetable) => (
                            <div 
                                key={timetable._id} 
                                className="mb-8 p-6 rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl"
                            >
                                {/* Branch + College Info */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold text-white">
                                        {timetable.branchId.branchName} ({timetable.branchId.year} Yr, Sec {timetable.branchId.section})
                                    </h3>
                                    <p className="text-sm text-white/70">
                                        College: {timetable.collegeId.institutionName}
                                    </p>
                                </div>

                                {/* Slots */}
                                <div className="grid gap-4">
                                    {timetable.slots.map((slot, slotIndex) => (
                                        <div key={slotIndex} className="border border-white/10 rounded-lg p-4 bg-white/5">
                                            <h4 className="text-lg font-semibold text-white mb-3">{slot.day}</h4>

                                            {slot.periods.length === 0 ? (
                                                <p className="text-white/50 text-sm">No periods scheduled</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {slot.periods.map((period, periodIndex) => (
                                                        <div 
                                                            key={periodIndex} 
                                                            className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow-sm border border-white/10"
                                                        >
                                                            <div>
                                                                <p className="text-white font-medium">
                                                                    Period {period.periodNumber}: {period.subject}
                                                                </p>
                                                                <p className="text-sm text-white/70">
                                                                    {period.startTime} - {period.endTime}
                                                                </p>
                                                            </div>
                                                            <p className="text-sm text-white/80">
                                                                Teacher: {period.teacherId?.fullName || "N/A"}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
        </div>
    );
};

export default TimeTableSection;
