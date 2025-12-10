import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileUploadButton } from '@/components/FileUploadButton';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfileSettings() {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState({
        username: '',
        display_name: '',
        bio: '',
        avatar_url: ''
    });

    useEffect(() => {
        if (user) {
            getProfile();
        }
    }, [user]);

    async function getProfile() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user!.id)
                .single();

            if (error) throw error;

            if (data) {
                setProfile({
                    username: data.username || '',
                    display_name: data.display_name || '',
                    bio: data.bio || '',
                    avatar_url: data.avatar_url || ''
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile() {
        try {
            setSaving(true);

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    user_id: user!.id,
                    username: profile.username,
                    display_name: profile.display_name,
                    bio: profile.bio,
                    avatar_url: profile.avatar_url,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            toast({
                title: "Success",
                description: "Profile updated successfully.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update profile",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    }

    if (!user) return null;

    return (
        <div className="container max-w-2xl mx-auto p-4 md:py-8">
            <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="mb-4 pl-0 hover:bg-transparent"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chat
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Manage your public profile information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col items-center gap-4">
                                <Avatar className="w-24 h-24 border-2 border-border">
                                    <AvatarImage src={profile.avatar_url} />
                                    <AvatarFallback className="text-2xl">
                                        {profile.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex items-center gap-2">
                                    <FileUploadButton
                                        onFileUploaded={(file) => setProfile({ ...profile, avatar_url: file.url })}
                                        variant="button"
                                        className="h-8"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={profile.username}
                                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                        placeholder="@username"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="display_name">Display Name</Label>
                                    <Input
                                        id="display_name"
                                        value={profile.display_name}
                                        onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                                        placeholder="Your Name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        value={profile.bio}
                                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                        placeholder="Tell us about yourself..."
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={updateProfile} disabled={saving}>
                                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
