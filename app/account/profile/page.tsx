"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserProfile, updateUserProfile, uploadAvatar } from "@/lib/api";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getUserProfile();
        setUser(res.data.user);
        setName(res.data.user?.name || "");
        setDepartment(res.data.user?.department || "");
      } catch (e) {}
    })();
  }, []);

  const onSave = async () => {
    try {
      await updateUserProfile({ name, department });
      Swal.fire({ icon: 'success', title: 'Profile updated' });
      router.push('/');
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'Update failed', text: e?.message || 'Please try again' });
    }
  };

  const onUploadAvatar = async () => {
    if (!avatarFile) return;
    try {
      const form = new FormData();
      form.append('avatar', avatarFile);
      await uploadAvatar(form);
      Swal.fire({ icon: 'success', title: 'Avatar updated' });
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'Upload failed', text: e?.message || 'Please try again' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              {user?.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : (
                <AvatarFallback>{(user?.name || 'U').split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <Input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
            </div>
            <Button onClick={onUploadAvatar} disabled={!avatarFile}>Upload</Button>
          </div>

          <div>
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Department</label>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={onSave}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


