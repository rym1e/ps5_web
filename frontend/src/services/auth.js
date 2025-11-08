export const loginWithMock = async () => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    token: 'mock-token',
    user: {
      id: 1,
      nickname: '测试用户',
      avatar_url: 'https://placekitten.com/96/96'
    }
  };
};
