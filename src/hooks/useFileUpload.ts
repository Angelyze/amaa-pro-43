
import { useState } from 'react';
import { toast } from 'sonner';

export type FileData = {
  type: string;
  name: string;
  data: string;
};

export function useFileUpload() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileData, setUploadedFileData] = useState<FileData | null>(null);

  const isImageFile = (fileType: string): boolean => {
    return fileType.startsWith('image/');
  };

  const handleUploadFile = async (file: File) => {
    try {
      setUploadedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = e.target?.result as string;
        setUploadedFileData({
          type: file.type,
          name: file.name,
          data: fileData
        });
      };
      reader.readAsDataURL(file);
      
      toast.success(`File uploaded: ${file.name}. Please ask a question about it.`);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('An error occurred while uploading your file');
    }
  };

  const resetFileUpload = () => {
    setUploadedFile(null);
    setUploadedFileData(null);
  };

  return {
    uploadedFile,
    uploadedFileData,
    isImageFile,
    handleUploadFile,
    resetFileUpload
  };
}
