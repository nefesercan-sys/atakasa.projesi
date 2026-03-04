export function successResponse(data: any, message = "Başarılı") {
  return {
    success: true,
    message,
    data,
  };
}

export function errorResponse(message = "Bir hata oluştu") {
  return {
    success: false,
    message,
  };
}
