import React from "react";

import { collection, getDocs } from "firebase/firestore";
//import { db } from "@/lib/firebase";
import SimLayout from "@/components/SimLayout";
import { queens, episodes, lipsyncs } from "@/constants/queenData";
import NavMenu from "@/components/NavMenu";

const page = async () => {

  //async function getUsers() {

  //const querySnapshot = await getDocs(collection(db, "episodes"));
  //const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  //return users;
  //}

  //const users = await getUsers();

  //console.log(users);
  return (
    <>
      <NavMenu />
      <SimLayout queens={queens}
        episodes={episodes}
        lipsyncs={lipsyncs} />
    </>
  )
};

export default page;

