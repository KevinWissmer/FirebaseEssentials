import { Firestore, onSnapshot, serverTimestamp, addDoc, collection, collectionData, doc, setDoc, deleteDoc, updateDoc, deleteField } from '@angular/fire/firestore';
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface ToDo {
  name: string;
  number?: number;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  currentIndex = 1;
  title = 'FirebaseProjektFull';

  //todo interface liegt an anderer stelle
  todos$: Observable<ToDo[]>;
  unsub;
  unsubSingle;
  unsubChange;
  todolist: ToDo[] = [];
  todoCollection

  //andere Option:
  // private firestore: Firestore = inject(Firestore);

  constructor(firestore: Firestore) {

    //subscribe classic
    this.todoCollection = collection(firestore, '/todos');
    //this.todoCollection = collection(firestore, '/todos/2/subcoll');   auch möglich direkt via pfad die subcollection auszuwählen
    this.todos$ = collectionData(this.todoCollection) as Observable<ToDo[]>;
    this.todos$.subscribe((allTodos) => { this.todolist = allTodos })

    //snapshot
    //ganze Collecetion subscriben
    this.unsub = onSnapshot(this.todoCollection, (allTodos) => {
      allTodos.forEach((singleTodo) => {
        console.log("Current data: ", singleTodo.data());
      });
    });

    //einzelnes document mit der ID "2" subscriben
    this.unsubSingle = onSnapshot(doc(this.todoCollection, '254sd6f5465ds4fg'), (singleTodo) => {
      console.log("document: ", singleTodo.data());
    });

    //ganze Collecetion subscriben mit docChanges()
    this.unsubChange = onSnapshot(this.todoCollection, (allTodos) => {
      allTodos.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("New Todo: ", change.doc.data());
        }
        if (change.type === "modified") {
          console.log("Modified Todo: ", change.doc.data());
        }
        if (change.type === "removed") {
          console.log("Removed Todo: ", change.doc.data());
        }
      })
    });

  }


  ngOnDestroy() {
    this.unsub()
    this.unsubSingle();
    this.unsubChange();
  }


  //document hinzufügen
  async addList() {
    let todoRef = await addDoc(this.todoCollection, {
      name: "Dein Titel",
    })
    .catch(err => console.log(err))
    .then((todoRef) => { console.log("Document written with addDoc: ", todoRef?.id) });
    ;
  }

  // löschen eines ganzen dokuments
  async deleteList(id: string) {
    await deleteDoc(doc(this.todoCollection, id)).catch(err => console.log(err));
  }

  //löschen eines feldes
  async deleteSingleField(id:string) {
    await updateDoc(doc(this.todoCollection, id), {
      number: deleteField()
    }).catch(err => console.log(err));
  }

  

  //feld hinzufügen oder updaten eines feldes
  async addSingleField(id:string) {
    await updateDoc(doc(this.todoCollection, id), {
      number: "2"
    }).catch(err => console.log(err));

    //   ebenso möglich verschachtelung:
    //   await updateDoc(frankDocRef, {
    //     "age": 13,
    //     "favorites.color": "Red"
    //    });

    //   Daten hätten folgendes Design:
    //     {
    //     name: "Frank",
    //     favorites: { food: "Pizza", color: "Blue", subject: "recess" },
    //     age: 12
    //      }

  }

  logTimestamp() {
    console.log(serverTimestamp());
  }
}