document
  .querySelector("#delete-current-folder-btn")
  .addEventListener("click", async () => {
    try {
      const folderId = window.location.href.split("/").reverse()[0];
      const response = await fetch(`/folders/${folderId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      console.log(result);

      if (response.status === 200) {
        window.location.href = "/dashboard";
      } else {
        document.querySelector("#content").innerHTML =
          `<div>${result.msg}</div>`;
      }
    } catch (err) {
      throw new Error(err);
    }
  });

const deleteFolderButtons = document.querySelectorAll(".delete-subfolder-btn");

for (let button of deleteFolderButtons) {
  button.addEventListener("click", async () => {
    try {
      const folderId = button.dataset.id;
      const response = await fetch(`/folders/${folderId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      console.log(result);

      if (response.status === 200) {
        window.location.href = "/dashboard";
      } else {
        const message = document.createElement("div");
        message.textContent = result.msg;
        button.parentNode.appendChild(message);
      }
    } catch (err) {
      throw new Error(err);
    }
  });
}
