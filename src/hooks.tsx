import { useEffect } from "react";

export type UserDataType = {
  maxHp: number;
  damage: number;
};


export const useSessionStorage = () => {
  // 情報取得
  const getUserData = (): UserDataType | undefined => {
    const temp = sessionStorage.getItem('userData');
    if (temp != null) {
      return JSON.parse(temp) as UserDataType;
    }
    return;
  };

  // 編集・追加
  const setUserData = (userData: UserDataType) => {
    const temp = JSON.stringify(userData);
    sessionStorage.setItem('userData', temp);
  };

  // 削除
  const deleteUserData = () => {
    sessionStorage.removeItem('userData');
  };
  return { getUserData, deleteUserData, setUserData };
};

export const useBlocker = (blocker: () => void, when = true) => {
  useEffect(() => {
    if (!when) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      blocker();
    };

    const handleBeforeRoute = (event: Event) => {
      event.preventDefault();
      blocker();
    };

    globalThis.addEventListener("beforeunload", handleBeforeUnload);
    globalThis.addEventListener("popstate", handleBeforeRoute);

    return () => {
      globalThis.removeEventListener("beforeunload", handleBeforeUnload);
      globalThis.removeEventListener("popstate", handleBeforeRoute);
    };
  }, [blocker, when]);
};
