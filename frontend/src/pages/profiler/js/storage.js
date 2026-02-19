const STORAGE_KEY = "match_profile_v2";

function loadAppState(state, profilesController){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return;

    const parsed = JSON.parse(raw);

    // UI
    if(parsed?.role) state.role = parsed.role;
    if(parsed?.answers) state.answers = parsed.answers;
    if(typeof parsed?.currentProfileId === "number") state.currentProfileId = parsed.currentProfileId;

    // Controller
    if(typeof parsed?.controller?.currentId === "number") profilesController.currentId = parsed.controller.currentId;
    if(Array.isArray(parsed?.controller?.items)) profilesController.items = parsed.controller.items;

    // Fallback: si no hay id actual pero hay items
    if(!state.currentProfileId && profilesController.items?.length){
      state.currentProfileId = profilesController.items[profilesController.items.length - 1]?.id ?? null;
    }
  }catch(e){}
}

function saveAppState(state, profilesController){
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    role: state.role,
    answers: state.answers,
    currentProfileId: state.currentProfileId,
    controller: {
      currentId: profilesController.currentId,
      items: profilesController.items
    }
  }));
}
