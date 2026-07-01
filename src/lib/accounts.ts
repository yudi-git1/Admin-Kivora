import { supabase } from "./supabase";


export async function getAccounts(){


const {data,error}=await supabase

.from("accounts")

.select("*")

.order(
"created_at",
{
ascending:false
}
);



if(error){

console.error(error);

return [];

}


return data;


}






export async function deleteAccount(id:string){


await supabase

.from("accounts")

.delete()

.eq(
"id",
id
);


}