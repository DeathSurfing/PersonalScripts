chrome.action.onClicked.addListener(async (tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: startMycamuSupreme
    });
  
    function startMycamuSupreme() {
      console.log("%c🔥 mycamu Supreme™ v6.9 Activated", "color: #ff5733; font-size: 18px;");
  
      const comments = [
        "Excellent session sir.",
        "Very interactive and knowledgeable session.",
        "Loved the teaching style.",
        "Very helpful and informative.",
        "Great explanation!",
        "One of the best classes I've attended."
      ];
  
      async function fillSurvey(surveyBtn) {
        surveyBtn.click();
        console.log("➡️ Taking Survey...");
        await new Promise(r => setTimeout(r, 3000));
  
        document.querySelectorAll("ul.rating").forEach((ul, index) => {
          const stars = ul.querySelectorAll("li");
          if (stars.length >= 5) {
            stars[4].querySelector("i[ng-click]").click();
            console.log(`⭐ ${index + 1}: 5 Stars`);
          }
        });
  
        document.querySelectorAll("textarea").forEach((el, index) => {
          el.value = comments[Math.floor(Math.random() * comments.length)];
          el.dispatchEvent(new Event("input", { bubbles: true }));
          console.log(`💬 Comment ${index + 1}: ${el.value}`);
        });
  
        let saveBtn = document.querySelector("button[ng-click='saveFeedback(disBtnOnReq)']");
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.removeAttribute("disabled");
          saveBtn.style.pointerEvents = "auto";
          await new Promise(r => setTimeout(r, 2000));
          saveBtn.click();
          console.log("✅ Survey Submitted");
        }
  
        console.log("⌛ Waiting 3 seconds for next survey...");
        await new Promise(r => setTimeout(r, 3000));
      }
  
      async function mycamuBhai() {
        while (true) {
          let surveyButtons = Array.from(document.querySelectorAll("button[ng-click='showFeedBack(fdbk)']"));
          if (surveyButtons.length === 0) {
            console.log("%c✅ All Surveys Completed Mycamu Bhai Mukhya Adhyapak", "color: green; font-size: 20px;");
            break;
          }
          console.log(`🔍 Found ${surveyButtons.length} Surveys`);
          await fillSurvey(surveyButtons[0]);
        }
      }
  
      mycamuBhai();
    }
  }
  