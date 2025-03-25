import { useQuery } from "@tanstack/react-query";
import { db } from "../firebase";
import { collection, orderBy, query, onSnapshot } from "firebase/firestore";

export const useChatMessages = () => {
  return useQuery({
    queryKey: ["messages"],
    queryFn: () =>
      new Promise((resolve) => {
        const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
        onSnapshot(q, (snapshot) => resolve(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))));
      }),
  });
};
