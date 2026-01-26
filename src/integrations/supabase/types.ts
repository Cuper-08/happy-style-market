export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          cep: string
          city: string
          complement: string | null
          created_at: string
          id: string
          is_default: boolean | null
          label: string | null
          neighborhood: string
          number: string
          state: string
          street: string
          user_id: string
        }
        Insert: {
          cep: string
          city: string
          complement?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          neighborhood: string
          number: string
          state: string
          street: string
          user_id: string
        }
        Update: {
          cep?: string
          city?: string
          complement?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          neighborhood?: string
          number?: string
          state?: string
          street?: string
          user_id?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
          variant_id: string | null
          variant_info: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price: number
          variant_id?: string | null
          variant_info?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
          variant_id?: string | null
          variant_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          discount: number | null
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          shipping_address: Json | null
          shipping_cost: number | null
          shipping_method: Database["public"]["Enums"]["shipping_method"] | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          tracking_code: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          discount?: number | null
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          shipping_method?:
            | Database["public"]["Enums"]["shipping_method"]
            | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          tracking_code?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          discount?: number | null
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          shipping_method?:
            | Database["public"]["Enums"]["shipping_method"]
            | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          tracking_code?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          color: string | null
          color_hex: string | null
          created_at: string
          id: string
          product_id: string
          size: string
          sku: string | null
          stock_quantity: number | null
        }
        Insert: {
          color?: string | null
          color_hex?: string | null
          created_at?: string
          id?: string
          product_id: string
          size: string
          sku?: string | null
          stock_quantity?: number | null
        }
        Update: {
          color?: string | null
          color_hex?: string | null
          created_at?: string
          id?: string
          product_id?: string
          size?: string
          sku?: string | null
          stock_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string | null
          category_id: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_new: boolean | null
          name: string
          retail_price: number
          slug: string
          updated_at: string
          wholesale_min_qty: number | null
          wholesale_price: number | null
        }
        Insert: {
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_new?: boolean | null
          name: string
          retail_price: number
          slug: string
          updated_at?: string
          wholesale_min_qty?: number | null
          wholesale_price?: number | null
        }
        Update: {
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_new?: boolean | null
          name?: string
          retail_price?: number
          slug?: string
          updated_at?: string
          wholesale_min_qty?: number | null
          wholesale_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cpf: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      order_status:
        | "pending"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_method: "pix" | "card" | "boleto"
      shipping_method: "pac" | "sedex" | "express"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_method: ["pix", "card", "boleto"],
      shipping_method: ["pac", "sedex", "express"],
    },
  },
} as const
