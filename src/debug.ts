export function enableShowingErrors() {
  const result = document.createElement("pre");
  result.setAttribute("id", "result");
  document.getElementsByTagName("body")[0].appendChild(result);
  window.addEventListener("error", function(error: any) {
    var message = [
      error.filename,
      "@",
      error.lineno,
      ":\n",
      error.message
    ].join("");
    result.textContent += "\n" + message;
    return false;
  });
}
