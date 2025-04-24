"use client"

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Clock, Loader2, Save, Shield} from "lucide-react";
import useFetch from "@/hooks/UseFetch";
import {getDealershipInfo, getUsers, saveWorkingHours, updateUserRole} from "@/actions/settings";
import {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";

const DAYS = [
    {value: "MONDAY", label: "Monday"},
    {value: "TUESDAY", label: "Tuesday"},
    {value: "WEDNESDAY", label: "Wednesday"},
    {value: "THURSDAY", label: "Thursday"},
    {value: "FRIDAY", label: "Friday"},
    {value: "SATURDAY", label: "Saturday"},
    {value: "SUNDAY", label: "Sunday"},
]

const SettingsForm = () => {

    const [workingHours, setWorkingHours] = useState(
        DAYS.map((day) => ({
            dayOfWeek: day.value,
            openTime: "09.00",
            closeTime: "18.00",
            isOpen: day.value !== "SUNDAY"
        }))
    );

    const [userSearch, setUserSearch] = useState("")

    const {
        loading: fetchingSettings,
        fn: fetchDealershipInfo,
        data: settingsData,
        error: settingsError,
    } = useFetch(getDealershipInfo)

    useEffect(() => {
        if (settingsData?.success && settingsData.data){
            const dealership = settingsData.data

            if (dealership.workingHours.length > 0){
                const mappedHours = DAYS.map(day => {
                    // find matching working hours
                    const hourData = dealership.workingHours.find(
                        (h) => h.dayOfWeek === day.value
                    )

                    if (hourData){
                        return {
                            dayOfWeek: hourData.dayOfWeek,
                            openTime: hourData.openTime,
                            closeTime: hourData.closeTime,
                            isOpen: hourData.isOpen,
                        }
                    }

                    // default value when no working hours is found
                    return {
                        dayOfWeek: day.value,
                        openTime: "09.00",
                        closeTime: "18.00",
                        isOpen: day.value !== "SUNDAY"
                    }
                })

                setWorkingHours(mappedHours)
            }
        }
    }, [settingsData]);

    const {
        loading: savingHours,
        fn: saveHours,
        data: saveResult,
        error: saveError,
    } = useFetch(saveWorkingHours)

    const {
        loading: fetchingUsers,
        fn: fetchUsers,
        data: usersData,
        error: usersError,
    } = useFetch(getUsers)

    const {
        loading: updatingRole,
        fn: updateRole,
        data: updateRoleResult,
        error: updateRoleError,
    } = useFetch(updateUserRole)

    useEffect(() => {
        fetchDealershipInfo()
        fetchUsers()
    }, []);

    const handleWorkingHourChange = (index, field, value) => {
        const updatedHours = [...workingHours]

        updatedHours[index] = {
            ...updatedHours[index],
            [field]: value,
        }

        setWorkingHours(updatedHours)
    }

    const handleSaveHours = async () => {
        await saveHours(workingHours)
    }

    useEffect(() => {
        if (saveResult?.success) {
            toast.success("Working hours saved successfully!")
            fetchDealershipInfo()
        }
    }, [saveResult]);

    return (
        <div className={`space-y-6`}>
            <Tabs defaultValue={`hours`}>
                <TabsList>
                    <TabsTrigger value="hours">
                        <Clock className={`mr-2 w-4 h-4`} />
                        Working Hours
                    </TabsTrigger>

                    <TabsTrigger value="admins">
                        <Shield className={`mr-2 w-4 h-4`} />
                        Admin Users
                    </TabsTrigger>
                </TabsList>

                <TabsContent
                    className={`space-y-6 mt-6`}
                    value={`hours`}>

                    <Card>
                        <CardHeader>
                            <CardTitle>Working Hours</CardTitle>
                            <CardDescription>Set your dealership's working hours for each day of the week.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={`space-y-4`}>
                                {DAYS.map((day, index) => {
                                    return (
                                        <div
                                            className={`grid grid-cols-12 gap-4 items-center py-3 px-4 rounded-lg hover:bg-slate-50`}
                                            key={index}>
                                            <div className={`col-span-3 md:col-span-2`}>
                                                <div className={`font-medium`}>{day.label}</div>
                                            </div>

                                            <div className={`col-span-9 md:col-span-2 flex items-center`}>
                                                <Checkbox
                                                    onCheckedChange={(checked) => {
                                                        handleWorkingHourChange(index, "isOpen", checked)
                                                    }}
                                                    checked={workingHours[index]?.isOpen}
                                                    id={`is-open-${day.value}`} />

                                                <Label
                                                    className={`ml-2 cursor-pointer`}
                                                    htmlFor={`is-open-${day.value}`}>
                                                    {workingHours[index]?.isOpen ? "Open" : "Closed"}

                                                </Label>
                                            </div>

                                            {workingHours[index]?.isOpen && (
                                                <>
                                                    <div className={`col-span-5 md:col-span-3`}>
                                                        <div className={`flex items-center`}>
                                                            <Clock className={`h-4 w-4 text-gray-400 mr-2`} />
                                                            <Input
                                                                value={workingHours[index]?.openTime}
                                                                onChange={(e) => {
                                                                    handleWorkingHourChange(
                                                                        index,
                                                                        "openTime",
                                                                        e.target.value,
                                                                    )
                                                                }}
                                                                className={`text-sm`}
                                                                type={`time`} />
                                                        </div>
                                                    </div>

                                                    <div className={`text-center col-span-1`}>to</div>

                                                    <div className={`col-span-5 md:col-span-3`}>
                                                        <div className={`flex items-center`}>
                                                            <Clock className={`h-4 w-4 text-gray-400 mr-2`} />
                                                            <Input
                                                                value={workingHours[index]?.closeTime}
                                                                onChange={(e) => {
                                                                    handleWorkingHourChange(
                                                                        index,
                                                                        "closeTime",
                                                                        e.target.value,
                                                                    )
                                                                }}
                                                                className={`text-sm`}
                                                                type={`time`} />
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {!workingHours[index]?.isOpen && (
                                                <div className={`col-span-11 md:col-span-8 text-gray-500 italic text-sm`}>
                                                    Closed All Day
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/*button*/}
                            <div className={`mt-6 flex justify-end`}>
                                <Button onClick={handleSaveHours} disabled={savingHours}>
                                    {savingHours ? (
                                        <>
                                            <Loader2 className={`mr-2 h-4 w-4 animate-spin`} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className={`mr-2 h-4 w-4`} />
                                            Save Working Hours
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                </TabsContent>

                <TabsContent value={`admins`} className={`space-y-6 mt-6`}>

                </TabsContent>
            </Tabs>
        </div>
    )
}
export default SettingsForm
