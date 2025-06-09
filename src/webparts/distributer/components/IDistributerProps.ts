export interface IDistributerProps {
  userGuid: string;
  refresh?: number;
  searchQuery?: string;
  updateCartCount?: () => void;
}

export interface Image {
  name: string;
  url: string;
}

export interface CartProps {
  userGuid: string;
  refresh?: boolean;
}

export interface CartItemProps {
  product: Product[];
  onDelete: (id: number) => void;
}

export interface CrudFormProps {
  title: string;
  isEditing: boolean;
  onChange: (event: React.FormEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export interface Item {
  Id: number;
  Title: string;
  Code: string;
}

export interface CartListProps {
  products: Product[];
  onDelete: (id: number) => void;
}

export interface CrudMessageProps {
  message: string;
}

export interface CardListProps {
  items: Item[];
  onDelete: (id: number) => void;
}

export interface Product {
  Price: string;
  codegoods: string;
  size: string;
  color: string;
  productgroup: string;
  IdCode: string;
  image: string;
  Id: number;
  Title: string;
  Code: string;
  djne: string;
  Inventory: string;
  cart: (id: number, title: string) => void;
  updateCartCount?: () => void;
}

export interface ProductsDivProps {
  products: Product[];
  cart: (id: number, title: string) => void;
  image: any;
  updateCartCount?: () => void;
  userName: string;
}

export interface CounterProps {
  product?: Product;
  onDelete: (id: number) => void;
}

export interface SearchBarProps {
  value: string;
  onChange: (event: React.FormEvent<HTMLInputElement>) => void;
}

export interface FilterBarProps {
  products?: Product[];
  onFilterChange: (filters: Partial<FilterBarState>) => void;
}

export interface FilterBarState {
  productgroup: string | number | string[];
  size: string;
  color: string;
  subcategory: string;
}

export interface ZarSimProduct {
  Image: string;
  Title: string;
  Code: string;
  Type: string;
  Count: number;
  Status: string;
  RequestedAmount: number;
  Inventory: number;
  date_farvardin: string;
  order0: string;
  serial: string;
  IdCode: string;
  size: string;
  color: string;
  productgroup: string;
  thermalclass: string;
  ghotreshte: number;
  number_x002f_stringdiameter: string;
  percentage: number;
  Price: string;
  Modified: string;
  Created: string;
  Author: string;
  Editor: string;
}

export interface CustomerInfo {
  CustomerCode?: string;
  [key: string]: any;
  AttachmentFiles: { __deferred: any };
  Attachments: boolean;
  AuthorId: number;
  CUstomerType: string | null;
  CarCategory: boolean;
  Car_Coef: number | null;
  City: string | null;
  ContentType: { __deferred: any };
  ContentTypeId: string;
  Created: string;
  CustomerBrandName: string | null;
  Date: string | null;
  EconomicNumber: string | null;
  EditorId: number;
  Email: string | null;
  FactoryAddress: string | null;
  FieldValuesAsHtml: { __deferred: any };
  FieldValuesAsText: { __deferred: any };
  FieldValuesForEdit: { __deferred: any };
  File: { __deferred: any };
  FileSystemObjectType: number;
  FirstUniqueAncestorSecurableObject: { __deferred: any };
  Folder: { __deferred: any };
  GUID: string;
  Genuine: boolean;
  GetDlpPolicyTip: { __deferred: any };
  ID: number;
  Id: number;
  Introduction: string | null;
  Label: string | null;
  Legal: boolean;
  Mobile: string | null;
  Mobile25: string | null;
  Modified: string;
  NationalNumber: string | null;
  NonCarCategory: boolean;
  OData__UIVersionString: string;
  OData__x062a__x063a__x06cc__x06cc__: string | null;
  OfficeAddress: string | null;
  ParentList: { __deferred: any };
  Permision: string | null;
  Permision2: string | null;
  Persenal: boolean;
  Phone: string | null;
  PostalCode: string | null;
  PurchaseProcedure: string | null;
  RegCode: string | null;
  RelatedPeople: string | null;
  Representationrequest: string | null;
  RoleAssignments: { __deferred: any };
  SalesExpert: string | null;
  SalesExpertAcunt: string | null;
  SalesExpertAcunt_text: string | null;
  State: string | null;
  SupportExpert: string | null;
  SupportExpertAcunt: string | null;
  SupportExpertAcunt_text: string | null;
  Title: string;
  Updated: string | null;
  UserName: string | null;
  WebSite: string | null;
  adresshaml: string | null;
  darsadinfo: string | null;
  group_mahsol_1: string | null;
  group_mahsol_2: string | null;
  guid_form: string | null;
  last_Date_Info: string | null;
  last_Discript: string | null;
  last_status_info: string | null;
  namayandegi: string | null;
  namayandegi_k: string | null;
  other: string | null;
  rateinfo: string | null;
  telephonhaml: string | null;
  __metadata: {
    id: string;
    uri: string;
    etag: string;
    type: string;
  };
}

export interface SPUser {
  Email: string;
  Groups: { __deferred: any };
  Id: number;
  IsHiddenInUI: boolean;
  IsShareByEmailGuestUser: boolean;
  IsSiteAdmin: boolean;
  LoginName: string;
  PrincipalType: number;
  Title: string;
  UserId: {
    NameId: string;
    NameIdIssuer: string;
    __metadata: {
      type: string;
    };
  };
  __metadata: {
    id?: string;
    uri?: string;
    type: string;
  };
}
