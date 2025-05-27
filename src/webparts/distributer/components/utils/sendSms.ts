export default function sendSmsToZarsimCEO(text: string, number: string) {
  let Http = new XMLHttpRequest();
  let url = `https://www.payam-resan.com/APISend.aspx?Username=09123146451&Password=80264547&From=2174541&To=${number}&Text=${text}`;
  Http.open("GET", url);
  Http.send();

  Http.onreadystatechange = (e) => {
    console.error(e);
  };
}
