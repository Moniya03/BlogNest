'use client';

import { useState } from 'react';
import { ArrowLeft, Edit, Save, X, User as UserIcon, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Page } from './App';
import { User } from '@/types';

interface ProfilePageProps {
  onPageChange: (page: Page) => void;
  user: User;
}

export function ProfilePage({ onPageChange, user }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name,
    bio: user.bio || '',
    location: user.location || '',
    profileImage: user.profileImage || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (imageUrl: string) => {
    setProfileData({
      ...profileData,
      profileImage: imageUrl
    });
  };

  const handleSave = () => {
    // Here you would typically save to the database
    console.log('Saving profile:', profileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData({
      name: user.name,
      bio: user.bio || '',
      location: user.location || '',
      profileImage: user.profileImage || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => onPageChange('home')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="mb-6">
                  {profileData.profileImage ? (
                    <img
                      src={profileData.profileImage}
                      alt="Profile"
                      className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full mx-auto bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <UserIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {profileData.name}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {profileData.bio || 'No bio yet'}
                </p>

                {isEditing && (
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    currentImage={profileData.profileImage}
                    label="Profile Image"
                    className="mt-4"
                  />
                )}

                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  

                  
                  {profileData.location && (
                    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{profileData.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Profile Information
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Manage your personal information and preferences
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={profileData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bio
                  </Label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={profileData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                    placeholder="Tell us about yourself..."
                  />
                </div>



                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    value={profileData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
                    placeholder="City, Country"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 