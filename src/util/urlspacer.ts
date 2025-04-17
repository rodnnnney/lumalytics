export const baseStorageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`;

export const customUrlFormatter = (pathParts: string[]) => {
    
    const encodedPath = pathParts.map(part => {
        // Only encode parts that need encoding (contain spaces or special chars)
        return part.includes(' ') || part.includes('&') || part.includes('?') || part.includes('=')
          ? encodeURIComponent(part)
          : part;
      }).join('/');
      

      return  baseStorageUrl + encodedPath;
      
}