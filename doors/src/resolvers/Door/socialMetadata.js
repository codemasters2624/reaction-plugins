/**
 * @name Door/socialMetadata
 * @method
 * @memberof Door/GraphQL
 * @summary Combines all social data for a door into single array
 * @param {Object} door - Door response from parent resolver
 * @returns {Object[]}  array of social media objects
 */
export default async function tags(door) {
  const {
    facebookMsg = "",
    googleplusMsg = "",
    pinterestMsg = "",
    twitterMsg = "",
  } = door;

  const socialMediaMessages = [
    {
      message: facebookMsg,
      service: "facebook",
    },
    {
      message: googleplusMsg,
      service: "googleplus",
    },
    {
      message: pinterestMsg,
      service: "pinterest",
    },
    {
      message: twitterMsg,
      service: "twitter",
    },
  ];

  return socialMediaMessages;
}
