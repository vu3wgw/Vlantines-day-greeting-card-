// Stub file for UI development - will be replaced by Convex
// Run `npx convex dev` to generate the real file

export const api = {
  healthCheck: {
    get: "healthCheck:get" as any,
  },
  videos: {
    createProject: "videos:createProject" as any,
    getProject: "videos:getProject" as any,
    getUserProjects: "videos:getUserProjects" as any,
    generateUploadUrl: "videos:generateUploadUrl" as any,
    addImageToProject: "videos:addImageToProject" as any,
    updateImage: "videos:updateImage" as any,
    deleteImage: "videos:deleteImage" as any,
    updateProject: "videos:updateProject" as any,
    deleteProject: "videos:deleteProject" as any,
    getProjectImages: "videos:getProjectImages" as any,
  },
  captions: {
    enhanceCaptions: "captions:enhanceCaptions" as any,
  },
  rendering: {
    startRender: "rendering:startRender" as any,
    getRenderStatus: "rendering:getRenderStatus" as any,
    getVideoDownloadUrl: "rendering:getVideoDownloadUrl" as any,
  },
};
