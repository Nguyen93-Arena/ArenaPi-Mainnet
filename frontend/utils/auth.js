export const getUserFromToken = async () => {
  if (typeof window === "undefined" || !window.Pi) return null;

  try {
    const scopes = ["username", "payments"];
    const user = await window.Pi.authenticate(scopes, (error, user) => {
      if (error) {
        console.error("Lỗi khi đăng nhập Pi:", error);
        return null;
      }
      return user;
    });

    return user;
  } catch (err) {
    console.error("Không thể lấy thông tin người dùng Pi:", err);
    return null;
  }
};
