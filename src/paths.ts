// Central place for all our paths

const paths = {
  home() {
    return "/";
  },
  topicShow(slug: string) {
    return `/topics/${slug}`;
  },
  postCreate(slug: string) {
    return `/topics/${slug}/posts/new`;
  },
  postShow(slug: string, postId: string) {
    return `/topics/${slug}/posts/${postId}`;
  },
};

export default paths;
