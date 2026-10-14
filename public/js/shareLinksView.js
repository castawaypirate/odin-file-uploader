const revokeBtns = document.querySelectorAll(".revoke-share-link-btn");

for (const btn of revokeBtns) {
  btn.addEventListener("click", async (event) => {
    btn.disabled = true;
    try {
      const revokeResponse = await fetch(
        `/share/links/${btn.dataset.token}/revoke`,
        {
          method: "DELETE",
        },
      );

      if (revokeResponse.status === 200) {
        const result = await revokeResponse.json();
        console.log(result);
        window.location.reload();
        return;
      }

      if (revokeResponse.status === 401) {
        window.location = "/login";
        return;
      }

      if ([400, 403, 404].includes(revokeResponse.status)) {
        const result = await revokeResponse.json();
        console.log(result);
        window.alert(result.msg);
      } else {
        window.alert("Something went wrong");
      }
    } catch (err) {
      console.error(err);
      window.alert("Something went wrong");
    }
    btn.disabled = false;
  });
}
