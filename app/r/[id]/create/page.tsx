/**
 * Post Creation Page for 10xR Community Platform
 *
 * Allows authenticated users to create new posts (text or image) in a community.
 * Features tabbed UI for post types and rich text editing with TipTap.
 *
 * Features:
 * - Tab-based UI for Text vs Image posts
 * - TipTap rich text editor with toolbar
 * - UploadThing integration for image uploads
 * - BetterAuth session validation
 * - Server action for secure post creation
 *
 * Stack:
 * - Next.js 16 Client Component
 * - TipTap for rich text editing
 * - UploadThing for file uploads
 * - BetterAuth for authentication
 * - Shadcn UI components
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useFormState } from 'react-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { SubmitButton } from '@/app/components/submit-button';
import { createPost, type ActionResponse } from '@/app/actions';
import { useUploadThing } from '@/lib/uploadthing';
import { toast } from 'sonner';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Undo,
  Redo,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';

/**
 * Initial state for the form
 * Used by useFormState hook
 */
const initialState: ActionResponse = {
  status: 'info',
  message: '',
};

/**
 * Post Creation Page Component
 *
 * Renders a form for creating text or image posts with rich editing capabilities.
 */
export default function CreatePostPage() {
  // ============================================================================
  // Route Parameters and State
  // ============================================================================
  const params = useParams();
  const communitySlug = params.id as string;

  // Post type state (text or image)
  const [postType, setPostType] = useState<'text' | 'image'>('text');

  // Image upload state
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // ============================================================================
  // TipTap Editor Configuration
  // ============================================================================
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[200px] focus:outline-none px-4 py-3',
      },
    },
  });

  // ============================================================================
  // UploadThing Hook for Image Uploads
  // ============================================================================
  const { startUpload } = useUploadThing('imageUploader', {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        setUploadedImageUrl(res[0].url);
        setIsUploadingImage(false);
        toast.success('Image uploaded successfully!');
      }
    },
    onUploadError: (error: Error) => {
      setIsUploadingImage(false);
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  // ============================================================================
  // Form State Management with Server Actions
  // ============================================================================
  const [state, formAction] = useFormState(createPost, initialState);

  // ============================================================================
  // Toast Notifications based on Server Action Response
  // ============================================================================
  useEffect(() => {
    if (state.message) {
      if (state.status === 'error') {
        toast.error(state.message, {
          duration: 4000,
        });
      }
    }
  }, [state]);

  // ============================================================================
  // Image Upload Handler
  // ============================================================================
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }

    // Validate file size (4MB max)
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image must be less than 4MB.');
      return;
    }

    setIsUploadingImage(true);
    await startUpload([file]);
  };

  // ============================================================================
  // Form Submit Handler
  // ============================================================================
  const handleSubmit = (formData: FormData) => {
    // Add the TipTap editor content as JSON
    if (postType === 'text' && editor) {
      formData.append('content', JSON.stringify(editor.getJSON()));
    }

    // Add post type and community slug
    formData.append('contentType', postType);
    formData.append('communitySlug', communitySlug);

    // Add image URL if it's an image post
    if (postType === 'image' && uploadedImageUrl) {
      formData.append('imageUrl', uploadedImageUrl);
    }

    // Call the server action
    formAction(formData);
  };

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto mt-8 px-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">
            Create a post in r/{communitySlug}
          </h1>
          <p className="text-sm text-muted-foreground">
            Share your thoughts with the community
          </p>
        </div>

        <Separator className="mb-6" />

        {/* Post Creation Form */}
        <Card>
          <CardContent className="p-6">
            <form action={handleSubmit}>
              {/* Post Type Tabs */}
              <Tabs
                value={postType}
                onValueChange={(value) => setPostType(value as 'text' | 'image')}
                className="mb-6"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">Text Post</TabsTrigger>
                  <TabsTrigger value="image">Image Post</TabsTrigger>
                </TabsList>

                {/* Text Post Tab */}
                <TabsContent value="text" className="space-y-4">
                  {/* Title Input */}
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium mb-2"
                    >
                      Title <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter your post title..."
                      required
                      maxLength={300}
                      className="w-full"
                    />
                  </div>

                  {/* TipTap Editor */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Content <span className="text-destructive">*</span>
                    </label>

                    {/* Editor Toolbar */}
                    {editor && (
                      <div className="border rounded-t-md bg-muted p-2 flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            editor.chain().focus().toggleBold().run()
                          }
                          className={
                            editor.isActive('bold') ? 'bg-accent' : ''
                          }
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                          }
                          className={
                            editor.isActive('italic') ? 'bg-accent' : ''
                          }
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            editor
                              .chain()
                              .focus()
                              .toggleHeading({ level: 2 })
                              .run()
                          }
                          className={
                            editor.isActive('heading', { level: 2 })
                              ? 'bg-accent'
                              : ''
                          }
                        >
                          <Heading2 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            editor.chain().focus().toggleBulletList().run()
                          }
                          className={
                            editor.isActive('bulletList') ? 'bg-accent' : ''
                          }
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            editor.chain().focus().toggleOrderedList().run()
                          }
                          className={
                            editor.isActive('orderedList') ? 'bg-accent' : ''
                          }
                        >
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                        <Separator orientation="vertical" className="mx-1" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => editor.chain().focus().undo().run()}
                          disabled={!editor.can().undo()}
                        >
                          <Undo className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => editor.chain().focus().redo().run()}
                          disabled={!editor.can().redo()}
                        >
                          <Redo className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* Editor Content */}
                    <div className="border rounded-b-md border-t-0">
                      <EditorContent editor={editor} />
                    </div>
                  </div>
                </TabsContent>

                {/* Image Post Tab */}
                <TabsContent value="image" className="space-y-4">
                  {/* Title Input */}
                  <div>
                    <label
                      htmlFor="image-title"
                      className="block text-sm font-medium mb-2"
                    >
                      Title <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="image-title"
                      name="title"
                      placeholder="Enter your post title..."
                      required
                      maxLength={300}
                      className="w-full"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Image <span className="text-destructive">*</span>
                    </label>

                    {/* Upload Button or Preview */}
                    {!uploadedImageUrl ? (
                      <div className="border-2 border-dashed rounded-md p-8 text-center">
                        <input
                          type="file"
                          id="image-upload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploadingImage}
                          className="hidden"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col items-center gap-2">
                            {isUploadingImage ? (
                              <>
                                <Upload className="h-8 w-8 text-muted-foreground animate-pulse" />
                                <p className="text-sm text-muted-foreground">
                                  Uploading...
                                </p>
                              </>
                            ) : (
                              <>
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Click to upload an image
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG, WEBP up to 4MB
                                </p>
                              </>
                            )}
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={uploadedImageUrl}
                          alt="Upload preview"
                          className="w-full rounded-md border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setUploadedImageUrl('')}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Form Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <SubmitButton
                  label="Create Post"
                  pendingLabel="Creating..."
                />
              </div>

              {/* Error Message */}
              {state.status === 'error' && state.message && (
                <p className="text-sm text-destructive mt-4" role="alert">
                  {state.message}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
