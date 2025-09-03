
import React from "react";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import SimLayout from "@/components/SimLayout";

const page = async () => {

  async function getUsers() {

    const querySnapshot = await getDocs(collection(db, "episodes"));
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return users;
  }

  //const users = await getUsers();

  let queens = [
    {
      id: '89INJU5hNdXC0eE7MhYQ',
      seasons: '10',
      name: "Asia O'Hara",
      url: 'https://static.wikia.nocookie.net/logosrupaulsdragrace/images/0/09/AsiaO%27HaraS10CastMug.jpg/revision/latest/scale-to-width-down/105?cb=20210831163151'
    },
    {
      id: 'GCPOER9gchnbUYypo6NE',
      seasons: '10',
      name: 'Mo Heart',
      url: 'https://static.wikia.nocookie.net/logosrupaulsdragrace/images/f/fe/MoniqueHeartS10CastMug.jpg/revision/latest/scale-to-width-down/105?cb=20210831163838'
    },
    {
      id: 'HpRBu08C9By6AItFjYXS',
      seasons: '10',
      name: 'Aquaria',
      url: 'https://static.wikia.nocookie.net/logosrupaulsdragrace/images/a/a9/AquariaS10CastMug.jpg/revision/latest/scale-to-width-down/105?cb=20210831163055'
    },
    {
      id: 'IuuiAIyabJzfcCfhhSFf',
      url: 'https://static.wikia.nocookie.net/logosrupaulsdragrace/images/f/f0/TheVixenS10CastMug.jpg/revision/latest/scale-to-width-down/105?cb=20210831164009',
      name: 'The Vixen',
      seasons: '10'
    },
    {
      id: 'Orf65XZogioI5B3Dn0Pe',
      name: 'Eureka',
      url: 'https://static.wikia.nocookie.net/logosrupaulsdragrace/images/9/9e/EurekaS10CastMug.jpg/revision/latest/scale-to-width-down/105?cb=20210831163344',
      seasons: '9,10'
    },
    {
      id: 'VpS44N9gYCu1NfjXhYdZ',
      name: 'Mayhem Miller',
      url: 'https://static.wikia.nocookie.net/logosrupaulsdragrace/images/9/96/MayhemMillerS10CastMug.jpg/revision/latest/scale-to-width-down/105?cb=20210831163657',
      seasons: '10'
    },
    {
      id: 'azOnO1m1uTeoFsHSBRS6',
      name: 'Dusty Ray Bottoms',
      url: 'https://static.wikia.nocookie.net/logosrupaulsdragrace/images/9/9c/DustyRayBottomsS10CastMug.jpg/revision/latest/scale-to-width-down/105?cb=20210831163312',
      seasons: '10'
    },
    {
      id: 'exRBLHWBm2DcOpU5PX9W',
      url: 'https://static.wikia.nocookie.net/logosrupaulsdragrace/images/1/15/KalorieKarbdashianWilliamsS10CastMug.jpg/revision/latest/scale-to-width-down/105?cb=20210831163436',
      seasons: '10',
      name: 'Kalorie Karbdashian Williams'
    },
    {
      id: 'f6GdfvE47XjaTx5B9SnI',
      name: 'Kameron Michaels',
      url: 'https://static.wikia.nocookie.net/logosrupaulsdragrace/images/6/6a/KameronMichaelsS10CastMug.jpg/revision/latest/scale-to-width-down/105?cb=20210831163523',
      seasons: '10'
    },
    {
      id: 'lTWffBQjI3kDqV1zUv0s',
      seasons: '10',
      name: 'Yuhua Hamasaki',
      url: 'https://static.wikia.nocookie.net/logosrupaulsdragrace/images/6/62/YuhuaHamasakiS10CastMug.jpg/revision/latest/scale-to-width-down/105?cb=20210831164124'
    },
    {
      id: 'm6XuY2322yfiJi64irLQ',
      seasons: '10',
      url: 'https://static.wikia.nocookie.net/logosrupaulsdragrace/images/d/dc/MizCrackerS10CastMug.jpg/revision/latest/scale-to-width-down/105?cb=20210831163727',
      name: 'Miz Cracker'
    },
    {
      id: 'rxNyWgSFuvoLo3qu6NpX',
      url: 'https://static.wikia.nocookie.net/logosrupaulsdragrace/images/0/06/VanessaVanjieMateoS10CastMug.jpg/revision/latest/scale-to-width-down/105?cb=20210831163920',
      seasons: '10',
      name: 'Vanessa Vanjie Mateo'
    },
    {
      id: 't4C78lcMTQjKW0Igtxmw',
      name: 'Monét X Change',
      url: 'https://static.wikia.nocookie.net/logosrupaulsdragrace/images/e/ea/Mon%C3%A9tXChangeS10CastMug.jpg/revision/latest/scale-to-width-down/105?cb=20210831163803',
      seasons: '10'
    },
    {
      id: 'zIAD00WTFnMvEP42tp39',
      url: 'https://static.wikia.nocookie.net/logosrupaulsdragrace/images/e/e8/BlairStClairS10CastMug.jpg/revision/latest/scale-to-width-down/105?cb=20210831163230',
      seasons: '10',
      name: 'Blair St. Clair'
    }
  ].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const episodes = [
    {
      id: 'EtQVuMqKSIH4wMfZ8BF2',
      title: 'Drag Con Panel Extravaganza',
      episodeNumber: 6,
      type: 'improv',
      description: "The queens have to produce and host their very own Drag Con panels on makeup, hair and body. The husband-and-wife duo behind the Oscar nominated film `The Big Sick', Kumail Nanjiani and Emily Gordon, guest judge.",
      season: '10'
    },
    {
      id: 'F89MeVmUerDTNusFjy31',
      season: '10',
      title: 'The Last Ball on Earth',
      episodeNumber: 4,
      description: 'The queens cook up global-warming-friendly looks for the last ball ever as actresses Tisha Campbell Martin and Logan Browning guest judge.',
      type: 'design,ball'
    },
    {
      id: 'FbMPMlvB760zXuvsoDOu',
      title: 'Evil Twins',
      type: 'improv,design',
      episodeNumber: 11,
      season: '10',
      description: "The queens give some of today's hottest social media superstars drag makeovers. Actor Miles Heizer from `13 Reasons Why' and hip-hop artist Lizzo are the guest judges."
    },
    {
      id: 'MReanRyzunBSWtgsPr4Q',
      season: '10',
      title: '10s Across the Board',
      type: 'design',
      description: "Christina Aguilera stunts on the mainstage. Fan favourite queens from the past decade of Drag Race return as 14 new queens compete to become America's Next Drag Superstar and win $100,000.",
      episodeNumber: 1
    },
    {
      id: 'RA7LXFcMgWuYEsPyR1fw',
      title: 'Grand Finale',
      description: "RuPaul crowns America's Next Drag Superstar as the top four battle it out in an epic lip sync smackdown for the crown.",
      season: '10',
      type: 'finale,lipsyncSmackdown',
      episodeNumber: 14
    },
    {
      id: 'RN7uhsO5IUuoJAfr39WR',
      title: 'Tap That App',
      episodeNumber: 3,
      type: 'branding,commercial',
      season: '10',
      description: 'The queens are tasked with making and starring in commercials for drag-themed dating apps. Courtney Love and Nico Tortorella join the judging panel.'
    },
    {
      id: 'fJZQA6dQ10RyeMahMGLg',
      description: "The queens' improvisational skills are put to the test for the new talk show, `Bossy Rossy', hosted by Ross Mathews. Country music singer Shania Twain and actress Carrie Preston are the guest judges.",
      season: '10',
      episodeNumber: 5,
      title: 'The Bossy Rossy Show',
      type: 'improv,comedy'
    },
    {
      id: 'iW7VprnyOIYCiz9fqglU',
      type: 'musicVideo',
      season: '10',
      title: 'American',
      description: "The top four queens must write a verse and execute it in a performance of RuPaul's hit single American, then guest on RuPaul's podcast with Michelle Visage. Later, choreographer Todrick Hall, style superstar Carson Kressley, and Ross Mathews join.",
      episodeNumber: 12
    },
    {
      id: 'kQyRRmN1D43iWgNkiylw',
      title: 'PharmaRusical',
      episodeNumber: 2,
      type: 'musical',
      description: 'The queens must wow the judges in a lip-sync dance number inspired by pharmaceutical TV adverts, as Halsey and Padma Lakshmi guest judge. Andy Cohen and Alyssa Edwards make a guest appearance.',
      season: '10'
    },
    {
      id: 'nmJHLIF3qQYs94RTEbPj',
      episodeNumber: 10,
      type: 'makeover',
      description: "The queens give some of today's hottest social media superstars drag makeovers. Actor Miles Heizer from `13 Reasons Why' and hip-hop artist Lizzo are the guest judges.",
      season: '10',
      title: 'Social Media Kings Into Queens'
    },
    {
      id: 'oJdzm98pPR1WOg3fMBfE',
      title: 'The Unauthorized Rusical',
      type: 'musical',
      season: '10',
      episodeNumber: 8,
      description: 'The queens celebrate four decades of Cher in a mini-musical choreographed by Todrick Hall. Billy Eichner and Andrew Rannells guest judge.'
    },
    {
      id: 'pMEb04DWCKx6w0ndErv0',
      episodeNumber: 7,
      season: '10',
      description: 'The queens must impersonate their favourite celebrities for the legendary snatch game, as Audra McDonald and Kate Upton guest judge. Bianca Del Rio and Alex Trebek are special guests.',
      type: 'improv,comedy,snatchGame',
      title: 'Snatch Game'
    },
    {
      id: 'xfZoym7wWq8866itTNUR',
      episodeNumber: 9,
      season: '10',
      description: "The queens are assigned parts and must act in the new hit series, `Breastworld'. `Broad City' stars Ilana Glazer and Abbi Jacobson guest judge, with Randy Rainbow and Stephen Colbert as special guests.",
      title: 'Breastworld',
      type: 'acting'
    }
  ].sort((a, b) => a.episodeNumber - b.episodeNumber);

  //console.log(users);
  return (
    <>
      <SimLayout queens={queens}
        episodes={episodes} />
    </>
  )
};

export default page;
