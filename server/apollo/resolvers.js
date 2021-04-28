const { RESTDataSource } = require("apollo-datasource-rest");
const imagesData = require("../data/images");
const UNSPLASH_API_KEY = "faGf8Qvphii5AO-4cmXEPILfr5uuAI_Kg4jMwoihLFs";

class PhotosApi extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = `https://api.unsplash.com/`;
  }

  willSendRequest(request) {
    request.headers.set("Authorization", this.context.accessKey);
  }

  async getImages(pageNum) {
    let data = await this.get(`photos`, { page: pageNum });
    let imagePosts = data.map((image) => this.imagePostObj(image));
    return imagePosts;
  }

  imagePostObj(image) {
    return {
      id: image.id,
      url: image.urls.regular,
      posterName: image.user && image.user.name,
      description: image.description || image.alt_description,
      userPosted: image.userPosted || false,
      binned: image.binned || false,
    };
  }
}

const resolvers = {
  Query: {
    unsplashImages: async (_, args, { dataSources }) => {
      return dataSources.photosApi.getImages(args.pageNum);
    },
    binnedImages: async () => {
      return await imagesData.getBinnedImages();
    },
    userPostedImages: async () => {
      return await imagesData.getUserImages();
    },
  },

  Mutation: {
    uploadImage: async (_, args) => {
      return await imagesData.uploadImage(args);
    },
    updateImage: async (_, args) => {
      return await imagesData.updateImage(args);
    },
    deleteImage: async (_, args) => {
      return await imagesData.deleteImage(args.id);
    },
  },
};

const dataSources = () => {
  return {
    photosApi: new PhotosApi(),
  };
};
const context = () => {
  return {
    accessKey: `Client-ID ${UNSPLASH_API_KEY}`,
  };
};

module.exports = {
  resolvers,
  dataSources,
  context,
};
