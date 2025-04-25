"use client"

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Clock, Loader2, Save, Search, Shield, Users, UserX} from "lucide-react";
import useFetch from "@/hooks/UseFetch";
import {getDealershipInfo, getUsers, saveWorkingHours, updateUserRole} from "@/actions/settings";
import {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

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

    const [userToUpdate, setUserToUpdate] = useState(null)
    const [isDialogMakeAdminOpen, setIsDialogMakeAdminOpen] = useState(false)
    const [isDialogRemoveAdminOpen, setIsDialogRemoveAdminOpen] = useState(false)

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

    const filteredUsers = usersData?.success ? usersData.data.filter( user =>
        user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase())
    )  : []

    const handleMakeAdmin = async (user) => {
        if (!userToUpdate) return;

        await updateRole(user?.id, "ADMIN");
        setIsDialogMakeAdminOpen(false);
        setUserToUpdate(null)

    };

    const handleRemoveAdmin = async (user) => {
        if (!userToUpdate) return;

        await updateRole(user?.id, "USER"); // ganti peran jadi USER (atau role default kamu)
        setIsDialogRemoveAdminOpen(false);
        setUserToUpdate(null)
    };


    useEffect(() => {
        if (settingsError){
            toast.error("Failed to load dealership settings")
        }

        if (saveError){
            toast.error(`Failed to save working hours: ${saveError.message}`)
        }

        if (usersError){
            toast.error("Failed to load users")
        }

        if (updateRoleError){
            toast.error("Failed to update user role")
        }

    }, [settingsError, saveError, usersError, updateRoleError]);

    useEffect(() => {
        if (saveResult?.success){
            toast.success("Working hours saved successfully!")
            fetchDealershipInfo()
        }
        if (updateRoleResult?.success){
            toast.success("User role updated successfully!")
            fetchUsers()
        }
    }, [saveResult, updateRoleResult]);

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
                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Users</CardTitle>
                            <CardDescription>Manage users with admin privileges</CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className={`mb-6 relative`} >
                                <Search className={`absolute left-2.5 top-2.5 h-4 w-4 text-gray-500`} />
                                <Input
                                    type={`search`}
                                    placeholder="Search users..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    className={`pl-9 w-full`} />
                            </div>

                            {fetchingUsers || fetchingSettings ? (
                                <div className={`py-12 flex justify-center`}>
                                    <Loader2 className={`mr-2 h-4 w-4 animate-spin`} />
                                </div>
                            ) : (
                                usersData?.success && filteredUsers.length > 0 ? (

                                    <>
                                        <div>
                                            <Table>

                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>User</TableHead>
                                                        <TableHead>Email</TableHead>
                                                        <TableHead>Role</TableHead>
                                                        <TableHead className={`text-right`}>Action</TableHead>
                                                    </TableRow>
                                                </TableHeader>

                                                <TableBody>

                                                    {filteredUsers.map((user) => {
                                                        return <>
                                                            <TableRow key={user.id}>

                                                                <TableCell>
                                                                    <div className={`flex items-center gap-2`}>
                                                                        <div className={`w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative`}>
                                                                            {user.imageUrl ? (
                                                                                <img src={user.imageUrl} alt={user.name || "User"} className={`w-full h-full object-cover`}/>
                                                                            ) : (
                                                                                <Users className={`h-4 w-4 text-gray-500`} />
                                                                            )}
                                                                        </div>
                                                                        <span>{user.name || "Unnamed User"}</span>
                                                                    </div>
                                                                </TableCell>

                                                                <TableCell>
                                                                    {user.email}
                                                                </TableCell>

                                                                <TableCell>
                                                                    <Badge className={user.role === "ADMIN" ? "bg-green-800" : "bg-gray-800"}>
                                                                        {user.role}
                                                                    </Badge>
                                                                </TableCell>

                                                                <TableCell className={`text-right`}>
                                                                    {user.role === "ADMIN" ? (
                                                                        <Button
                                                                            size={`sm`}
                                                                            className={`text-red-600`}
                                                                            disabled={updatingRole}
                                                                            onClick={() => {
                                                                                setUserToUpdate(user);
                                                                                setIsDialogRemoveAdminOpen(true);
                                                                            }}
                                                                            variant={`outline`}>
                                                                            <UserX className={`mr-2 w-4 h-4`} />
                                                                            Remove Admin
                                                                        </Button>
                                                                    ) : (
                                                                        <Button
                                                                            size={`sm`}
                                                                            className={`text-red-600`}
                                                                            disabled={updatingRole}
                                                                            onClick={() => {
                                                                                setUserToUpdate(user);
                                                                                setIsDialogMakeAdminOpen(true);
                                                                            }}                                                                            variant={`outline`}>
                                                                            <Shield className={`mr-2 w-4 h-4`} />
                                                                            Make Admin
                                                                        </Button>
                                                                    )}
                                                                </TableCell>

                                                            </TableRow>
                                                        </>
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </>
                                ) : (
                                    <div className={`py-12 text-center`}>
                                        <Users className={`h-12 w-12 text-gray-300 mx-auto mb-4`} />
                                        <h3 className={`text-lg font-medium text-gray-900 mb-1`}>
                                            No users found
                                        </h3>

                                        <p className={`text-gray-500`}>
                                            {userSearch
                                                ? "No users match your search criteria."
                                                : "There are no user registered yet"
                                            }
                                        </p>
                                    </div>
                                )
                            )}
                        </CardContent>
                    </Card>

                    {/*dialog make admin*/}
                    <Dialog open={isDialogMakeAdminOpen} setOpenChange={setIsDialogMakeAdminOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirm Make Admin</DialogTitle>
                                <DialogDescription>Are you sure you want to make {userToUpdate?.name} as admin?</DialogDescription>
                            </DialogHeader>

                            <DialogFooter>
                                <Button
                                    variant={`outline`}
                                    onClick={() => setIsDialogMakeAdminOpen(false)}
                                    disbled={updatingRole}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    variant={`default`}
                                    onClick={() => handleMakeAdmin(userToUpdate)}
                                    disabled={updatingRole}
                                >
                                    {updatingRole ? (
                                        <>
                                            <Loader2 className={`mr-2 w-4 h-4 animate-spin`}/>
                                            Updating...
                                        </>
                                    ) : ("Update Role")}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/*dialog remove admin*/}
                    <Dialog open={isDialogRemoveAdminOpen} setOpenChange={setIsDialogRemoveAdminOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirm Remove Admin</DialogTitle>
                                <DialogDescription>Are you sure you want to remove {userToUpdate?.name} as admin?</DialogDescription>
                            </DialogHeader>

                            <DialogFooter>
                                <Button
                                    variant={`outline`}
                                    onClick={() => setIsDialogRemoveAdminOpen(false)}
                                    disbled={updatingRole}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    variant={`default`}
                                    onClick={() => handleRemoveAdmin(userToUpdate)}
                                    disabled={updatingRole}
                                >
                                    {updatingRole ? (
                                        <>
                                            <Loader2 className={`mr-2 w-4 h-4 animate-spin`}/>
                                            Updating...
                                        </>
                                    ) : ("Update Role")}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>


                </TabsContent>
            </Tabs>
        </div>
    )
}
export default SettingsForm
