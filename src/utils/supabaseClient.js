
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Function to get download URL for a file
const getFileUrl = (bucketName, filePath) => {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return data.publicUrl;
  }
  
  // Updated upload function that returns the URL
  const uploadFile = async (bucketName, filePath, file) => {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file)
    if (error) {
      throw new Error(`Error uploading file: ${error.message}`)
    }
    
    // Get and return the public URL along with the data
    const url = getFileUrl(bucketName, filePath);
    return { data, url };
  }
  
  // Export the supabase client and the storage functions
  export { supabase, uploadFile, getFileUrl }
